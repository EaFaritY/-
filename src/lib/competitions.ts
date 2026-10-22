import "server-only";
import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { academicYears, competitions, studentResults } from "@/db/schema";
import type { CompetitionListItem, CompetitionInput } from "./competitions-types";

export { CATEGORY_OPTIONS, type CategoryOption, type CompetitionListItem, type CompetitionInput } from "./competitions-types";

const PAGE_SIZE = 20;

export async function getActiveAcademicYear() {
  const [year] = await db.select().from(academicYears).where(eq(academicYears.isActive, true)).limit(1);
  return year ?? null;
}

export interface CompetitionListResult {
  items: CompetitionListItem[];
  total: number;
  page: number;
  pageSize: number;
  academicYearBe: number | null;
}

export async function listCompetitions(opts: { query?: string; page?: number }): Promise<CompetitionListResult> {
  const activeYear = await getActiveAcademicYear();
  const page = Math.max(1, opts.page ?? 1);

  if (!activeYear) {
    return { items: [], total: 0, page: 1, pageSize: PAGE_SIZE, academicYearBe: null };
  }

  const conditions = [eq(competitions.academicYearId, activeYear.id)];
  if (opts.query) {
    conditions.push(ilike(competitions.name, `%${opts.query}%`));
  }

  const [{ count: total }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(competitions)
    .where(and(...conditions));

  const rows = await db
    .select({
      id: competitions.id,
      name: competitions.name,
      sportType: competitions.sportType,
      category: competitions.category,
      ageGroup: competitions.ageGroup,
      color: competitions.color,
    })
    .from(competitions)
    .where(and(...conditions))
    .orderBy(desc(competitions.createdAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  // NOTE: deliberately NOT a correlated subquery interpolating column objects
  // into `sql`...``` — Drizzle doesn't auto-qualify those with a table name,
  // and since both `competitions` and `student_results` have an `id` column,
  // Postgres silently binds the unqualified name to the wrong (inner) scope,
  // making every row report the same total count. A separate GROUP BY query
  // joined in JS avoids that trap entirely.
  const ids = rows.map((r) => r.id);
  const counts = ids.length
    ? await db
        .select({ competitionId: studentResults.competitionId, count: sql<number>`count(*)::int` })
        .from(studentResults)
        .where(inArray(studentResults.competitionId, ids))
        .groupBy(studentResults.competitionId)
    : [];
  const countByCompetitionId = new Map(counts.map((c) => [c.competitionId, c.count]));

  const items: CompetitionListItem[] = rows.map((r) => ({
    ...r,
    resultCount: countByCompetitionId.get(r.id) ?? 0,
  }));

  return { items, total, page, pageSize: PAGE_SIZE, academicYearBe: activeYear.yearBe };
}

export async function createCompetition(input: CompetitionInput) {
  const activeYear = await getActiveAcademicYear();
  if (!activeYear) throw new Error("ยังไม่ได้ตั้งค่าปีการศึกษาที่ใช้งาน");

  const [row] = await db
    .insert(competitions)
    .values({
      name: input.name,
      sportType: input.sportType,
      category: input.category,
      ageGroup: input.ageGroup || null,
      color: input.color,
      academicYearId: activeYear.id,
    })
    .returning();
  return row;
}

export async function updateCompetition(id: number, input: CompetitionInput) {
  const [row] = await db
    .update(competitions)
    .set({
      name: input.name,
      sportType: input.sportType,
      category: input.category,
      ageGroup: input.ageGroup || null,
      color: input.color,
    })
    .where(eq(competitions.id, id))
    .returning();
  return row ?? null;
}

export async function deleteCompetition(id: number) {
  const [row] = await db.delete(competitions).where(eq(competitions.id, id)).returning();
  return row ?? null;
}
