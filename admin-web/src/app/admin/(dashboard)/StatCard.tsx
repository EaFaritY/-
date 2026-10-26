import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]">
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-[var(--color-text)]">{value}</p>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}
