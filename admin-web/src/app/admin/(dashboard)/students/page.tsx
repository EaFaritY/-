import Link from "next/link";
import { listStudents, getResultsForStudents, listCompetitionOptions } from "@/lib/students";
import type { StudentResultItem } from "@/lib/students-types";
import StudentsTable from "./StudentsTable";

function firstValue(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = firstValue(sp.q).trim();
  const classRoom = firstValue(sp.classRoom).trim();
  const page = Number(firstValue(sp.page)) || 1;

  const [result, competitionOptions] = await Promise.all([
    listStudents({ query: query || undefined, classRoom: classRoom || undefined, page }),
    listCompetitionOptions(),
  ]);

  const resultsMap = await getResultsForStudents(result.items.map((s) => s.id));
  const resultsByStudentId: Record<number, StudentResultItem[]> = {};
  for (const item of result.items) {
    resultsByStudentId[item.id] = resultsMap.get(item.id) ?? [];
  }

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const pageHref = (p: number) => `/admin/students?q=${encodeURIComponent(query)}&classRoom=${encodeURIComponent(classRoom)}&page=${p}`;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text)]">นักเรียน</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {result.academicYearBe ? `ปีการศึกษา ${result.academicYearBe} · ทั้งหมด ${result.total} คน` : "ยังไม่ได้ตั้งค่าปีการศึกษาที่ใช้งาน"}
        </p>
      </div>

      <form method="GET" className="mb-4 flex flex-wrap gap-3">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="ค้นหารหัส/ชื่อ/นามสกุล..."
          className="w-full max-w-xs rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
        <input
          name="classRoom"
          type="text"
          defaultValue={classRoom}
          placeholder="ชั้น/ห้อง เช่น 5/2"
          className="w-full max-w-[160px] rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          ค้นหา
        </button>
      </form>

      <StudentsTable items={result.items} resultsByStudentId={resultsByStudentId} competitionOptions={competitionOptions} />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={pageHref(p)}
              className={`rounded-md px-3 py-1.5 text-sm ${
                p === result.page
                  ? "bg-[var(--color-primary)] text-white"
                  : "border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
