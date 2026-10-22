import { and, eq, ilike, sql } from "drizzle-orm";
import { db } from "@/db";
import { students, studentResults, competitions, certificates, academicYears, searchLogs } from "@/db/schema";

export interface SearchInput {
  studentId?: string;
  firstName?: string;
  lastName?: string;
  classRoom?: string;
}

export interface SearchResultItem {
  resultId: number;
  competition: string;
  sportType: string;
  category: string;
  color: string;
  result: string;
  certificateId: number | null;
}

export interface SearchStudent {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  class: string;
  room: string;
  results: SearchResultItem[];
}

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * Flexible, case/space-insensitive search across student ID, name, and
 * class/room — any subset of fields can be supplied, matching the "search by
 * ID alone, or name alone, or ID + class" requirement from the spec.
 *
 * Only ever queries within the currently-active academic year, and always
 * requires at least one field, so an empty request can't dump the table.
 */
export async function searchStudents(input: SearchInput): Promise<SearchStudent[]> {
  const studentId = input.studentId ? normalize(input.studentId) : "";
  const firstName = input.firstName ? normalize(input.firstName) : "";
  const lastName = input.lastName ? normalize(input.lastName) : "";
  const classRoom = input.classRoom ? normalize(input.classRoom) : "";

  if (!studentId && !firstName && !lastName && !classRoom) return [];

  await db.insert(searchLogs).values({});

  const [activeYear] = await db.select().from(academicYears).where(eq(academicYears.isActive, true)).limit(1);
  if (!activeYear) return [];

  const conditions = [eq(students.academicYearId, activeYear.id)];
  if (studentId) conditions.push(ilike(students.studentId, `%${studentId}%`));
  if (firstName) conditions.push(ilike(students.firstNameNormalized, `%${firstName}%`));
  if (lastName) conditions.push(ilike(students.lastNameNormalized, `%${lastName}%`));
  if (classRoom) {
    conditions.push(
      sql`(lower(${students.class} || '/' || ${students.room}) LIKE ${"%" + classRoom + "%"} OR lower(${students.class}) LIKE ${"%" + classRoom + "%"})`
    );
  }

  const matchedStudents = await db
    .select()
    .from(students)
    .where(and(...conditions))
    .limit(20);

  if (matchedStudents.length === 0) return [];

  return Promise.all(matchedStudents.map(toSearchStudent));
}

async function fetchResultsForStudent(studentDbId: number): Promise<SearchResultItem[]> {
  return db
    .select({
      resultId: studentResults.id,
      competition: competitions.name,
      sportType: competitions.sportType,
      category: competitions.category,
      color: competitions.color,
      result: studentResults.result,
      certificateId: certificates.id,
    })
    .from(studentResults)
    .innerJoin(competitions, eq(studentResults.competitionId, competitions.id))
    .leftJoin(certificates, eq(certificates.studentResultId, studentResults.id))
    .where(eq(studentResults.studentId, studentDbId));
}

async function toSearchStudent(s: typeof students.$inferSelect): Promise<SearchStudent> {
  const results = await fetchResultsForStudent(s.id);
  return {
    id: s.id,
    studentId: s.studentId,
    firstName: s.firstName,
    lastName: s.lastName,
    class: s.class,
    room: s.room,
    results,
  };
}

/**
 * Resolves a single student by internal id, scoped to the active academic
 * year. Used to load the chosen student after a disambiguation pick, without
 * re-running (and potentially re-matching several rows from) the fuzzy
 * search.
 */
export async function getStudentById(id: number): Promise<SearchStudent | null> {
  const [activeYear] = await db.select().from(academicYears).where(eq(academicYears.isActive, true)).limit(1);
  if (!activeYear) return null;

  const [s] = await db
    .select()
    .from(students)
    .where(and(eq(students.id, id), eq(students.academicYearId, activeYear.id)))
    .limit(1);

  return s ? toSearchStudent(s) : null;
}

export interface CertificateView {
  certificateId: number;
  filePath: string;
  result: string;
  competitionName: string;
  color: string;
  studentId: string;
  firstName: string;
  lastName: string;
  class: string;
  room: string;
}

export async function getCertificateById(certificateId: number): Promise<CertificateView | null> {
  const [row] = await db
    .select({
      certificateId: certificates.id,
      filePath: certificates.filePath,
      result: studentResults.result,
      competitionName: competitions.name,
      color: competitions.color,
      studentId: students.studentId,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      room: students.room,
    })
    .from(certificates)
    .innerJoin(studentResults, eq(certificates.studentResultId, studentResults.id))
    .innerJoin(competitions, eq(studentResults.competitionId, competitions.id))
    .innerJoin(students, eq(studentResults.studentId, students.id))
    .where(eq(certificates.id, certificateId))
    .limit(1);

  return row ?? null;
}

export async function getStudentResultWithCertificate(resultId: number) {
  const [row] = await db
    .select({
      resultId: studentResults.id,
      result: studentResults.result,
      competitionName: competitions.name,
      color: competitions.color,
      studentId: students.studentId,
      firstName: students.firstName,
      lastName: students.lastName,
      class: students.class,
      room: students.room,
      certificateFilePath: certificates.filePath,
    })
    .from(studentResults)
    .innerJoin(competitions, eq(studentResults.competitionId, competitions.id))
    .innerJoin(students, eq(studentResults.studentId, students.id))
    .leftJoin(certificates, eq(certificates.studentResultId, studentResults.id))
    .where(eq(studentResults.id, resultId))
    .limit(1);

  return row ?? null;
}
