import Link from "next/link";
import { EVENT_NAME, SCHOOL_NAME } from "@/lib/theme";

export default function PublicHeader() {
  return (
    <header className="no-print border-b border-[var(--color-border)] bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg text-white">
            🏆
          </span>
          <span>
            <span className="block text-sm font-semibold text-[var(--color-text)]">{EVENT_NAME}</span>
            <span className="block text-xs text-[var(--color-text-muted)]">{SCHOOL_NAME}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
