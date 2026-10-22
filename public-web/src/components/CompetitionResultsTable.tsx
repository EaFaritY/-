import Link from "next/link";
import ResultChip from "./ResultChip";
import type { SearchResultItem } from "@/lib/search";

export default function CompetitionResultsTable({ results }: { results: SearchResultItem[] }) {
  if (results.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-white px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
        นักเรียนคนนี้ยังไม่มีข้อมูลการแข่งขันในปีการศึกษานี้
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--color-border)] bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)] bg-[var(--color-primary-light)] text-left text-[var(--color-primary-dark)]">
            <th className="px-4 py-3 font-medium">รายการแข่งขัน</th>
            <th className="px-4 py-3 font-medium">ประเภท</th>
            <th className="px-4 py-3 font-medium">ผลการแข่งขัน</th>
            <th className="px-4 py-3 font-medium text-right">ใบเกียรติบัตร</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.resultId} className="border-b border-[var(--color-border)] last:border-0">
              <td className="px-4 py-3">
                <div className="font-medium text-[var(--color-text)]">{r.competition}</div>
                <div className="text-xs text-[var(--color-text-muted)]">สีกีฬา: {r.color}</div>
              </td>
              <td className="px-4 py-3 text-[var(--color-text-muted)]">
                {r.sportType} · {r.category}
              </td>
              <td className="px-4 py-3">
                <ResultChip result={r.result} />
              </td>
              <td className="px-4 py-3 text-right">
                {r.certificateId ? (
                  <Link
                    href={`/certificate/${r.certificateId}`}
                    className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-dark)]"
                  >
                    ดูใบเกียรติบัตร
                  </Link>
                ) : (
                  <span className="text-xs text-[var(--color-text-muted)]">ยังไม่มีไฟล์</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
