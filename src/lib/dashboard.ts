import { and, desc, eq, ne, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { students, competitions, studentResults, certificates, academicYears, searchLogs } from "@/db/schema";
import { formatRelativeThai } from "./format";

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000;

function startOfTodayBangkokUtc(): Date {
  const now = new Date();
  const bangkokNow = new Date(now.getTime() + BANGKOK_OFFSET_MS);
  const startUtcMillis = Date.UTC(
    bangkokNow.getUTCFullYear(),
    bangkokNow.getUTCMonth(),
    bangkokNow.getUTCDate(),
    0,
    0,
    0
  );
  return new Date(startUtcMillis - BANGKOK_OFFSET_MS);
}

export interface DashboardStats {
  academicYearBe: number | null;
  totalStudents: number;
  studentsWithAward: number;
  totalCompetitions: number;
  totalCertificates: number;
  searchesToday: number;
  lastAdded: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [activeYear] = await db.select().from(academicYears).where(eq(academicYears.isActive, true)).limit(1);

  if (!activeYear) {
    return {
      academicYearBe: null,
      totalStudents: 0,
      studentsWithAward: 0,
      totalCompetitions: 0,
      totalCertificates: 0,
      searchesToday: 0,
      lastAdded: "ไม่มีข้อมูล",
    };
  }

  const [[{ count: totalStudents }], [{ count: totalCompetitions }], [{ count: totalCertificates }], [{ count: studentsWithAward }], [{ count: searchesToday }], [lastStudent]] =
    await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(students)
        .where(eq(students.academicYearId, activeYear.id)),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(competitions)
        .where(eq(competitions.academicYearId, activeYear.id)),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(certificates)
        .innerJoin(studentResults, eq(certificates.studentResultId, studentResults.id))
        .innerJoin(students, eq(studentResults.studentId, students.id))
        .where(eq(students.academicYearId, activeYear.id)),

      db
        .select({ count: sql<number>`count(distinct ${studentResults.studentId})::int` })
        .from(studentResults)
        .innerJoin(students, eq(studentResults.studentId, students.id))
        .where(and(eq(students.academicYearId, activeYear.id), ne(studentResults.result, "participated"))),

      db
        .select({ count: sql<number>`count(*)::int` })
        .from(searchLogs)
        .where(gte(searchLogs.createdAt, startOfTodayBangkokUtc())),

      db
        .select({ firstName: students.firstName, lastName: students.lastName, createdAt: students.createdAt })
        .from(students)
        .where(eq(students.academicYearId, activeYear.id))
        .orderBy(desc(students.createdAt))
        .limit(1),
    ]);

  return {
    academicYearBe: activeYear.yearBe,
    totalStudents,
    studentsWithAward,
    totalCompetitions,
    totalCertificates,
    searchesToday,
    lastAdded: lastStudent ? `${lastStudent.firstName} ${lastStudent.lastName} (${formatRelativeThai(lastStudent.createdAt)})` : "ไม่มีข้อมูล",
  };
}
