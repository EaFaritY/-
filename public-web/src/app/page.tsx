import PublicHeader from "@/components/PublicHeader";
import { EVENT_NAME } from "@/lib/theme";

export default function HomePage() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-[var(--color-text)] sm:text-3xl">{EVENT_NAME}</h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              ค้นหาผลการแข่งขันและใบเกียรติบัตรของนักเรียน — กรอกข้อมูลอย่างน้อย 1 ช่อง
            </p>
          </div>

          <form action="/result" method="GET" className="rounded-xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">รหัสนักเรียน</span>
                <input
                  name="studentId"
                  type="text"
                  placeholder="เช่น 10234"
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ชั้น/ห้อง</span>
                <input
                  name="classRoom"
                  type="text"
                  placeholder="เช่น 5/2"
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ชื่อ</span>
                <input
                  name="firstName"
                  type="text"
                  placeholder="ชื่อจริง"
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">นามสกุล</span>
                <input
                  name="lastName"
                  type="text"
                  placeholder="นามสกุล"
                  className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
                />
              </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex items-center rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              >
                ค้นหารางวัล
              </button>
              <button
                type="reset"
                className="inline-flex items-center rounded-md border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
              >
                ล้างข้อมูล
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
