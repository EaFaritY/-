import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { EVENT_NAME, SCHOOL_NAME } from "@/lib/theme";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  const admin = await getCurrentAdmin();
  if (admin) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-4">
      <div className="w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl text-white">
            🔐
          </span>
          <h1 className="text-lg font-bold text-[var(--color-text)]">เข้าสู่ระบบผู้ดูแล</h1>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {EVENT_NAME} · {SCHOOL_NAME}
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
