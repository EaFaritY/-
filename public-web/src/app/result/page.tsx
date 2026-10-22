import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import CompetitionResultsTable from "@/components/CompetitionResultsTable";
import { searchStudents } from "@/lib/search";

function firstValue(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const studentId = firstValue(sp.studentId).trim();
  const firstName = firstValue(sp.firstName).trim();
  const lastName = firstValue(sp.lastName).trim();
  const classRoom = firstValue(sp.classRoom).trim();

  const hasAnyField = !!(studentId || firstName || lastName || classRoom);
  const results = hasAnyField ? await searchStudents({ studentId, firstName, lastName, classRoom }) : [];

  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-6">
            <Link href="/" className="text-sm text-[var(--color-primary)] hover:underline">
              ← ค้นหาใหม่
            </Link>
          </div>

          {!hasAnyField && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
              <p className="text-[var(--color-text)]">กรุณากรอกข้อมูลอย่างน้อย 1 ช่องเพื่อค้นหา</p>
            </div>
          )}

          {hasAnyField && results.length === 0 && (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-8 text-center">
              <div className="mb-2 text-4xl">🔍</div>
              <p className="font-medium text-[var(--color-text)]">ไม่พบข้อมูลที่ตรงกับการค้นหา</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                ลองตรวจสอบรหัสนักเรียน ชื่อ-นามสกุล หรือชั้น/ห้องอีกครั้ง
              </p>
            </div>
          )}

          {results.length > 1 && (
            <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
              <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                พบ {results.length} รายการที่ตรงกับการค้นหา กรุณาเลือกนักเรียน
              </p>
              <ul className="divide-y divide-[var(--color-border)]">
                {results.map((s) => (
                  <li key={s.id} className="py-3">
                    <Link
                      href={`/result?studentId=${encodeURIComponent(s.studentId)}`}
                      className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-[var(--color-primary-light)]"
                    >
                      <span>
                        <span className="font-medium text-[var(--color-text)]">
                          {s.firstName} {s.lastName}
                        </span>
                        <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                          รหัส {s.studentId} · ชั้น {s.class}/{s.room}
                        </span>
                      </span>
                      <span className="text-[var(--color-primary)]">ดูผล →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {results.length === 1 && (
            <div>
              <div className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-6">
                <h1 className="text-xl font-bold text-[var(--color-text)]">
                  {results[0].firstName} {results[0].lastName}
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  รหัสนักเรียน {results[0].studentId} · ชั้น {results[0].class}/{results[0].room}
                </p>
              </div>
              <CompetitionResultsTable results={results[0].results} />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
