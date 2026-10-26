"use client";

import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Pencil, Trash2, Plus } from "lucide-react";
import type { StudentListItem, StudentResultItem, CompetitionOption } from "@/lib/students-types";
import StudentFormModal from "./StudentFormModal";
import DeleteStudentDialog from "./DeleteStudentDialog";
import StudentResultsPanel from "./StudentResultsPanel";

export default function StudentsTable({
  items,
  resultsByStudentId,
  competitionOptions,
}: {
  items: StudentListItem[];
  resultsByStudentId: Record<number, StudentResultItem[]>;
  competitionOptions: CompetitionOption[];
}) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [modalState, setModalState] = useState<"closed" | "new" | StudentListItem>("closed");
  const [deleteTarget, setDeleteTarget] = useState<StudentListItem | null>(null);

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setModalState("new")}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={16} />
          เพิ่มนักเรียน
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-primary-light)] text-left text-[var(--color-primary-dark)]">
              <th className="w-10 px-4 py-3"></th>
              <th className="px-4 py-3 font-medium">รหัสนักเรียน</th>
              <th className="px-4 py-3 font-medium">ชื่อ-นามสกุล</th>
              <th className="px-4 py-3 font-medium">ชั้น/ห้อง</th>
              <th className="px-4 py-3 font-medium text-center">จำนวนรายการ</th>
              <th className="px-4 py-3 font-medium text-center">ได้รับรางวัล</th>
              <th className="px-4 py-3 font-medium text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-[var(--color-text-muted)]">
                  ยังไม่มีนักเรียน
                </td>
              </tr>
            )}
            {items.map((s) => {
              const isExpanded = expandedId === s.id;
              return (
                <Fragment key={s.id}>
                  <tr
                    className="cursor-pointer border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                    onClick={() => setExpandedId(isExpanded ? null : s.id)}
                  >
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-text)]">{s.studentId}</td>
                    <td className="px-4 py-3 text-[var(--color-text)]">
                      {s.firstName} {s.lastName}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-muted)]">
                      {s.class}/{s.room}
                    </td>
                    <td className="px-4 py-3 text-center text-[var(--color-text)]">{s.resultCount}</td>
                    <td className="px-4 py-3 text-center text-[var(--color-text)]">{s.awardCount}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setModalState(s);
                          }}
                          className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)]"
                          aria-label="แก้ไข"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(s);
                          }}
                          className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600"
                          aria-label="ลบ"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} className="p-0">
                        <StudentResultsPanel
                          studentDbId={s.id}
                          results={resultsByStudentId[s.id] ?? []}
                          competitionOptions={competitionOptions}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {modalState !== "closed" && (
        <StudentFormModal
          key={modalState === "new" ? "new" : modalState.id}
          student={modalState === "new" ? null : modalState}
          onClose={() => setModalState("closed")}
        />
      )}

      {deleteTarget && <DeleteStudentDialog student={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
