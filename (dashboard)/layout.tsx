import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import Sidebar from "./Sidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  // Defense in depth: proxy.ts already redirects unauthenticated requests
  // away from /admin/*, but this layout checks again in case it's ever
  // reached a different way (e.g. a future route not covered by the matcher).
  if (!admin) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <Sidebar username={admin.username} />
      <main className="flex-1 overflow-x-hidden px-6 py-6 sm:px-8">{children}</main>
    </div>
  );
}
