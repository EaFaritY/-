import {
  pgTable,
  pgEnum,
  serial,
  bigserial,
  bigint,
  integer,
  varchar,
  boolean,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Result of a competition entry. Kept as a Postgres enum (rather than a free
 * text column) so bad values can never enter the database — mirrors the
 * "dropdown only" requirement from the spec.
 */
export const resultTypeEnum = pgEnum("result_type", [
  "winner",
  "runner_up",
  "second_runner_up",
  "honorable_mention",
  "participated",
]);

export const academicYears = pgTable("academic_years", {
  id: serial("id").primaryKey(),
  yearBe: integer("year_be").notNull().unique(),
  isActive: boolean("is_active").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const students = pgTable(
  "students",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    studentId: varchar("student_id", { length: 20 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    // Normalized (trimmed + lowercased) copies used for forgiving search.
    firstNameNormalized: varchar("first_name_normalized", { length: 100 }).notNull(),
    lastNameNormalized: varchar("last_name_normalized", { length: 100 }).notNull(),
    class: varchar("class", { length: 20 }).notNull(),
    room: varchar("room", { length: 20 }).notNull(),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("students_student_id_academic_year_id_key").on(table.studentId, table.academicYearId),
    index("idx_students_student_id").on(table.studentId),
    index("idx_students_class_room_year").on(table.academicYearId, table.class, table.room),
  ]
);

export const competitions = pgTable(
  "competitions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    name: varchar("name", { length: 150 }).notNull(),
    sportType: varchar("sport_type", { length: 100 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    ageGroup: varchar("age_group", { length: 50 }),
    color: varchar("color", { length: 50 }).notNull(),
    academicYearId: integer("academic_year_id")
      .notNull()
      .references(() => academicYears.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_competitions_year").on(table.academicYearId)]
);

export const studentResults = pgTable(
  "student_results",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    studentId: bigint("student_id", { mode: "number" })
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    competitionId: bigint("competition_id", { mode: "number" })
      .notNull()
      .references(() => competitions.id, { onDelete: "cascade" }),
    result: resultTypeEnum("result").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("student_results_student_id_competition_id_key").on(table.studentId, table.competitionId),
    index("idx_results_student").on(table.studentId),
    index("idx_results_competition").on(table.competitionId),
  ]
);

export const certificates = pgTable("certificates", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  studentResultId: bigint("student_result_id", { mode: "number" })
    .notNull()
    .unique()
    .references(() => studentResults.id, { onDelete: "cascade" }),
  // Storage key. Local dev writes to /public/uploads; production should point
  // this at an S3/R2 object key per the architecture doc's storage abstraction.
  filePath: varchar("file_path", { length: 500 }).notNull(),
  fileType: varchar("file_type", { length: 10 }).notNull(),
  originalFilename: varchar("original_filename", { length: 255 }),
  fileSizeBytes: integer("file_size_bytes"),
  widthPx: integer("width_px"),
  heightPx: integer("height_px"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const admins = pgTable("admins", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  // Always stored lower-cased at the application layer to emulate
  // case-insensitive usernames without depending on the citext extension.
  username: varchar("username", { length: 100 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("admin"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    adminId: bigint("admin_id", { mode: "number" }).references(() => admins.id),
    action: varchar("action", { length: 50 }).notNull(),
    targetType: varchar("target_type", { length: 50 }).notNull(),
    targetId: bigint("target_id", { mode: "number" }),
    details: jsonb("details"),
    ipAddress: varchar("ip_address", { length: 45 }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_audit_admin").on(table.adminId),
    index("idx_audit_created").on(table.createdAt),
  ]
);

export const importJobs = pgTable("import_jobs", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  adminId: bigint("admin_id", { mode: "number" }).references(() => admins.id),
  source: varchar("source", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  totalRows: integer("total_rows"),
  successRows: integer("success_rows"),
  errorRows: integer("error_rows"),
  errorFilePath: varchar("error_file_path", { length: 500 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

/**
 * One row per successful public search. Not in the original architecture
 * doc's table list — added so the admin dashboard's "search count" stat
 * reflects real usage instead of a placeholder number. A natural home for
 * this to later move into Redis once that layer exists (see architecture
 * doc section G), at which point this table can be dropped.
 */
export const searchLogs = pgTable(
  "search_logs",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("idx_search_logs_created").on(table.createdAt)]
);

/* Relations — used by db.query.students.findMany({ with: { results: ... } }) */
export const studentsRelations = relations(students, ({ many, one }) => ({
  results: many(studentResults),
  academicYear: one(academicYears, {
    fields: [students.academicYearId],
    references: [academicYears.id],
  }),
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
  results: many(studentResults),
}));

export const studentResultsRelations = relations(studentResults, ({ one }) => ({
  student: one(students, { fields: [studentResults.studentId], references: [students.id] }),
  competition: one(competitions, { fields: [studentResults.competitionId], references: [competitions.id] }),
  certificate: one(certificates, {
    fields: [studentResults.id],
    references: [certificates.studentResultId],
  }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  studentResult: one(studentResults, {
    fields: [certificates.studentResultId],
    references: [studentResults.id],
  }),
}));
