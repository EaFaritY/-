import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <div className="mb-3 text-5xl">🏳️</div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">ไม่พบหน้าที่คุณต้องการ</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">หน้านี้อาจถูกย้ายหรือไม่มีอยู่</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-md bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            กลับไปหน้าค้นหา
          </Link>
        </div>
      </main>
    </>
  );
}
