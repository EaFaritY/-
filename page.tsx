import { notFound } from "next/navigation";
import { SIDEBAR_ITEMS } from "@/lib/admin-nav";

// Catch-all for sidebar sections not yet built. Real feature pages (e.g.
// /admin/competitions, /admin/students) take precedence automatically since
// Next.js prefers the more specific route over this one.
export default async function AdminPlaceholderPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const href = `/admin/${slug.join("/")}`;
  const item = SIDEBAR_ITEMS.find((i) => i.href === href);

  if (!item) notFound();

  return (
    <div>
      <h1 className="text-xl font-bold text-[var(--color-text)]">{item.label}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] bg-white p-10 text-center">
        <p className="text-[var(--color-text-muted)]">ส่วนนี้ยังอยู่ระหว่างการพัฒนา — เร็ว ๆ นี้</p>
      </div>
    </div>
  );
}
