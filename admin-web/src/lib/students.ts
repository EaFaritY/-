import "server-only";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { academicYears, students, studentResults, competitions, certificates } from "@/db/schema";
import type { StudentListItem, StudentInput, CompetitionOption, StudentResultItem } from "./students-types";

export { type StudentListItem, type StudentInput, type CompetitionOption, type StudentResultItem } from "./students-types";

const PAGE_SIZE = 20;

/**
 * drizzle-orm's node-postgres driver wraps the underlying pg error in a
 * DrizzleQueryError, putting the real error (with its `.code`) on `.cause`.
 * Check both spots so this keeps working if that wrapping ever changes.
 */
function isUniqueViolation(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: unknown }).code;
  if (code === "23505") return true;
  const cause = (err as { cause?: unknown }).cause;
  if (cause && typeof cause === "object") {
    return (cause as { code?: unknown }).code === "23505";
  }
  return false;
}

export async function getActiveAcademicYear() {
  const [year] = await db.select().from(academicYears).where(eq(academicYears.isActive, true)).limit(1);
  return year ?? null;
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

export interface StudentListResult {
  items: StudentListItem[];
  total: number;
  page: number;
  pageSize: number;
  academicYearBe: number | null;
}

export async function listStudents(opts: { query?: string; classRoom?: string; page?: number }): Promise<StudentListResult> {
  const activeYear = await getActiveAcademicYear();
  const page = Math.max(1, opts.page ?? 1);

  if (!activeYear) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, academicYearBe: null };
  }

  const conditions = [eq(students.academicYearId, activeYear.id)];
  if (opts.query) {
    const q = normalize(opts.query);
    conditions.push(
      or(ilike(students.studentId, `%${q}%`), ilike(students.firstNameNormalized, `%${q}%`), ilike(students.lastNameNormalized, `%${q}%`))!
    );
  }
  if (opts.classRoom) {
    const cr = normalize(opts.classRoom);
    conditions.push(sql`lower(${students.class} || '/' || ${students.room}) LIKE ${"%" + cr + "%"}`);
  }

  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(students)
    .where(and(...conditions));

  const rows = await db
    .select({
      id: students.id,
      studentId: students.studentId,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      room: students.room,
    })
    .from(students)
    .where(and(...conditions))
    .orderBy(desc(students.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  // See the note in listCompetitions() for why this is a separate GROUP BY
  // query joined in JS rather than a correlated subquery.
  const ids = rows.map((r) => r.id);
  const counts = ids.length
    ? await db
        .select({
          studentId: studentResults.studentId,
          total: sql<number>`count(*)::int`,
          awards: sql<number>`count(*) filter (where ${studentResults.result} != 'participated')::int`,
        })
        .from(studentResults)
        .where(inArray(studentResults.studentId, ids))
        .groupBy(studentResults.studentId)
    : [];
  const countMap = new Map(counts.map((c) => [c.studentId, c]));

  const items: StudentListItem[] = rows.map((r) => ({
    ...r,
    resultCount: countMap.get(r.id)?.total ?? 0,
    awardCount: countMap.get(r.id)?.awards ?? 0,
  }));

  return { items, total, page, pageSize: PAGE_SIZE, academicYearBe: activeYear.yearBe };
}

export class DuplicateStudentIdError extends Error {}

export async function createStudent(input: StudentInput) {
  const activeYear = await getActiveAcademicYear();
  if (!activeYear) throw new Error("ยังไม่ได้ตั้งค่าปีการศึกษาที่ใช้งาน");

  try {
    const [row] = await db
      .insert(students)
      .values({
        studentId: input.studentId,
        firstName: input.firstName,
        lastName: input.lastName,
        firstNameNormalized: normalize(input.firstName),
        lastNameNormalized: normalize(input.lastName),
        class: input.class,
        room: input.room,
        academicYearId: activeYear.id,
      })
      .returning();
    return row;
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      throw new DuplicateStudentIdError(`รหัสนักเรียน ${input.studentId} มีอยู่แล้วในปีการศึกษานี้`);
    }
    throw err;
  }
}

export async function updateStudent(id: number, input: StudentInput) {
  try {
    const [row] = await db
      .update(students)
      .set({
        studentId: input.studentId,
        firstName: input.firstName,
        lastName: input.lastName,
        firstNameNormalized: normalize(input.firstName),
        lastNameNormalized: normalize(input.lastName),
        class: input.class,
        room: input.room,
        updatedAt: new Date(),
      })
      .where(eq(students.id, id))
      .returning();
    return row ?? null;
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      throw new DuplicateStudentIdError(`รหัสนักเรียน ${input.studentId} มีอยู่แล้วในปีการศึกษานี้`);
    }
    throw err;
  }
}

export async function deleteStudent(id: number) {
  const [row] = await db.delete(students).where(eq(students.id, id)).returning();
  return row ?? null;
}

export async function getStudentResults(studentDbId: number): Promise<StudentResultItem[]> {
  return db
    .select({
      resultId: studentResults.id,
      competitionId: studentResults.competitionId,
      competitionName: competitions.name,
      color: competitions.color,
      result: studentResults.result,
      certificateId: certificates.id,
    })
    .from(studentResults)
    .innerJoin(competitions, eq(studentResults.competitionId, competitions.id))
    .leftJoin(certificates, eq(certificates.studentResultId, studentResults.id))
    .where(eq(studentResults.studentId, studentDbId));
}

export async function getResultsForStudents(studentDbIds: number[]): Promise<Map<number, StudentResultItem[]>> {
  const map = new Map<number, StudentResultItem[]>();
  if (studentDbIds.length === 0) return map;

  const rows = await db
    .select({
      studentId: studentResults.studentId,
      resultId: studentResults.id,
      competitionId: studentResults.competitionId,
      competitionName: competitions.name,
      color: competitions.color,
      result: studentResults.result,
      certificateId: certificates.id,
    })
    .from(studentResults)
    .innerJoin(competitions, eq(studentResults.competitionId, competitions.id))
    .leftJoin(certificates, eq(certificates.studentResultId, studentResults.id))
    .where(inArray(studentResults.studentId, studentDbIds));

  for (const { studentId, ...rest } of rows) {
    const list = map.get(studentId) ?? [];
    list.push(rest);
    map.set(studentId, list);
  }
  return map;
}

export async function listCompetitionOptions(): Promise<CompetitionOption[]> {
  const activeYear = await getActiveAcademicYear();
  if (!activeYear) return [];
  return db
    .select({ id: competitions.id, name: competitions.name, color: competitions.color })
    .from(competitions)
    .where(eq(competitions.academicYearId, activeYear.id))
    .orderBy(competitions.name);
}

export class DuplicateResultError extends Error {}

export async function addResult(studentDbId: number, competitionId: number, result: string) {
  try {
    const [row] = await db
      .insert(studentResults)
      .values({ studentId: studentDbId, competitionId, result: result as (typeof studentResults.$inferInsert)["result"] })
      .returning();
    return row;
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      throw new DuplicateResultError("นักเรียนคนนี้มีผลการแข่งขันของรายการนี้อยู่แล้ว");
    }
    throw err;
  }
}

export async function updateResult(resultId: number, competitionId: number, result: string) {
  try {
    const [row] = await db
      .update(studentResults)
      .set({ competitionId, result: result as (typeof studentResults.$inferInsert)["result"], updatedAt: new Date() })
      .where(eq(studentResults.id, resultId))
      .returning();
    return row ?? null;
  } catch (err: unknown) {
    if (isUniqueViolation(err)) {
      throw new DuplicateResultError("นักเรียนคนนี้มีผลการแข่งขันของรายการนี้อยู่แล้ว");
    }
    throw err;
  }
}

export async function deleteResult(resultId: number) {
  const [row] = await db.delete(studentResults).where(eq(studentResults.id, resultId)).returning();
  return row ?? null;
}

export async function hasCertificateForResult(resultId: number): Promise<boolean> {
  const [row] = await db.select({ id: certificates.id }).from(certificates).where(eq(certificates.studentResultId, resultId)).limit(1);
  return !!row;
}
