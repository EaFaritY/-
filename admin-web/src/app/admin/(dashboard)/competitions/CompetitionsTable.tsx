"use client";

import { useState } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { CompetitionListItem } from "@/lib/competitions-types";
import CompetitionFormModal from "./CompetitionFormModal";
import DeleteCompetitionDialog from "./DeleteCompetitionDialog";

export default function CompetitionsTable({ items }: { items: CompetitionListItem[] }) {
  const [modalState, setModalState] = useState<"closed" | "new" | CompetitionListItem>("closed");
  const [deleteTarget, setDeleteTarget] = useState<CompetitionListItem | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setModalState("new")}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={16} />
          เพิ่มรายการแข่งขัน
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-primary-light)] text-left text-[var(--color-primary-dark)]">
              <th className="px-4 py-3 font-medium">ชื่อรายการแข่งขัน</th>
              <th className="px-4 py-3 font-medium">ประเภท</th>
              <th className="px-4 py-3 font-medium">รุ่นอายุ</th>
              <th className="px-4 py-3 font-medium">สีกีฬา</th>
              <th className="px-4 py-3 font-medium text-center">จำนวนผล</th>
              <th className="px-4 py-3 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                  ยังไม่มีรายการแข่งขัน
                </td>
              </tr>
            )}
            {items.map((c) => (
              <tr key={c.id} className="border-b border-[var(--color-border)] last:border-0">
                <td className="px-4 py-3 font-medium text-[var(--color-text)]">{c.name}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">
                  {c.sportType} · {c.category}
                </td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.ageGroup || "—"}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)]">{c.color}</td>
                <td className="px-4 py-3 text-center text-[var(--color-text)]">{c.resultCount}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModalState(c)}
                      className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)]"
                      aria-label="แก้ไข"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(c)}
                      className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600"
                      aria-label="ลบ"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalState !== "closed" && (
        <CompetitionFormModal
          key={modalState === "new" ? "new" : modalState.id}
          competition={modalState === "new" ? null : modalState}
          onClose={() => setModalState("closed")}
        />
      )}

      {deleteTarget && <DeleteCompetitionDialog competition={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
