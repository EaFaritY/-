"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { SIDEBAR_ITEMS } from "@/lib/admin-nav";
import { logoutAction } from "../login/actions";

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-shrink-0 flex-col border-r border-[var(--color-border)] bg-white">
      <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-5 py-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">🏆</span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">ระบบผู้ดูแล</p>
          <p className="text-xs text-[var(--color-text-muted)]">{username}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]"
                      : "text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <form action={logoutAction} className="border-t border-[var(--color-border)] px-3 py-4">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] hover:text-red-600"
        >
          <LogOut size={18} />
          ออกจากระบบ
        </button>
      </form>
    </aside>
  );
}
