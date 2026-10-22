import Link from "next/link";
import { listCompetitions } from "@/lib/competitions";
import CompetitionsTable from "./CompetitionsTable";

function firstValue(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function CompetitionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const query = firstValue(sp.q).trim();
  const page = Number(firstValue(sp.page)) || 1;

  const result = await listCompetitions({ query: query || undefined, page });
  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[var(--color-text)]">รายการแข่งขัน</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {result.academicYearBe ? `ปีการศึกษา ${result.academicYearBe} · ทั้งหมด ${result.total} รายการ` : "ยังไม่ได้ตั้งค่าปีการศึกษาที่ใช้งาน"}
        </p>
      </div>

      <form method="GET" className="mb-4">
        <input
          name="q"
          type="text"
          defaultValue={query}
          placeholder="ค้นหาชื่อรายการแข่งขัน..."
          className="w-full max-w-xs rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      </form>

      <CompetitionsTable items={result.items} />

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/competitions?q=${encodeURIComponent(query)}&page=${p}`}
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
