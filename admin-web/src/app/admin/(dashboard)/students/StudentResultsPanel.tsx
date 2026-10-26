"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Upload, Eye, RefreshCw } from "lucide-react";
import ResultChip from "@/components/ResultChip";
import type { CompetitionOption, StudentResultItem } from "@/lib/students-types";
import ResultFormModal from "./ResultFormModal";
import DeleteResultDialog from "./DeleteResultDialog";
import { uploadCertificateAction, deleteCertificateAction, type CertificateFormState } from "./actions";

const uploadInitialState: CertificateFormState = {};

function CertificateCell({ result }: { result: StudentResultItem }) {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(uploadCertificateAction, uploadInitialState);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      // Upload just finished successfully — the panel's data refreshes via
      // revalidatePath, so just close the inline uploader.
      setIsUploadOpen(false);
    }
    wasPending.current = isPending;
  }, [isPending, state.error]);

  function handleDeleteCertificate() {
    if (!result.certificateId) return;
    startDeleteTransition(async () => {
      const res = await deleteCertificateAction(result.certificateId!);
      if (res.error) setDeleteError(res.error);
    });
  }

  if (isUploadOpen) {
    return (
      <form action={formAction} className="flex flex-col gap-2">
        <input type="hidden" name="resultId" value={result.resultId} />
        <input
          ref={fileInputRef}
          name="file"
          type="file"
          accept=".jpg,.jpeg,image/jpeg"
          required
          className="text-xs"
        />
        <p className="text-xs text-[var(--color-text-muted)]">รองรับเฉพาะ JPG ขนาดไม่เกิน 8MB</p>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1 text-xs font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
          >
            {isPending ? "กำลังอัปโหลด..." : "อัปโหลด"}
          </button>
          <button
            type="button"
            onClick={() => setIsUploadOpen(false)}
            className="rounded-md border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    );
  }

  if (result.certificateId) {
    return (
      <div className="flex items-center gap-2">
        <a
          href={`${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? ""}/certificate/${result.certificateId}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          <Eye size={14} />
          ดู
        </a>
        <button
          type="button"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
        >
          <RefreshCw size={14} />
          เปลี่ยนไฟล์
        </button>
        <button
          type="button"
          onClick={handleDeleteCertificate}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          <Trash2 size={14} />
          {isDeleting ? "กำลังลบ..." : "ลบ"}
        </button>
        {deleteError && <span className="text-xs text-red-600">{deleteError}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsUploadOpen(true)}
      className="inline-flex items-center gap-1 rounded-md border border-dashed border-[var(--color-primary)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
    >
      <Upload size={14} />
      อัปโหลดใบเกียรติบัตร
    </button>
  );
}

export default function StudentResultsPanel({
  studentDbId,
  results,
  competitionOptions,
}: {
  studentDbId: number;
  results: StudentResultItem[];
  competitionOptions: CompetitionOption[];
}) {
  const [resultModalState, setResultModalState] = useState<"closed" | "new" | StudentResultItem>("closed");
  const [deleteTarget, setDeleteTarget] = useState<StudentResultItem | null>(null);

  return (
    <div className="bg-[var(--color-bg)] px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[var(--color-text)]">ผลการแข่งขัน</h3>
        <button
          type="button"
          onClick={() => setResultModalState("new")}
          className="inline-flex items-center gap-1 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--color-primary-dark)]"
        >
          <Plus size={14} />
          เพิ่มผลการแข่งขัน
        </button>
      </div>

      {results.length === 0 ? (
        <p className="rounded-md border border-dashed border-[var(--color-border)] bg-white px-3 py-4 text-center text-sm text-[var(--color-text-muted)]">
          ยังไม่มีผลการแข่งขัน
        </p>
      ) : (
        <div className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-[var(--color-text-muted)]">
                <th className="px-3 py-2 font-medium">รายการแข่งขัน</th>
                <th className="px-3 py-2 font-medium">ผลการแข่งขัน</th>
                <th className="px-3 py-2 font-medium">ใบเกียรติบัตร</th>
                <th className="px-3 py-2 font-medium text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.resultId} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-3 py-2 text-[var(--color-text)]">{r.competitionName}</td>
                  <td className="px-3 py-2">
                    <ResultChip result={r.result} />
                  </td>
                  <td className="px-3 py-2">
                    <CertificateCell result={r} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setResultModalState(r)}
                        className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary-dark)]"
                        aria-label="แก้ไข"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(r)}
                        className="rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600"
                        aria-label="ลบ"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {resultModalState !== "closed" && (
        <ResultFormModal
          key={resultModalState === "new" ? "new" : resultModalState.resultId}
          studentDbId={studentDbId}
          competitionOptions={competitionOptions}
          existingResult={resultModalState === "new" ? null : resultModalState}
          onClose={() => setResultModalState("closed")}
        />
      )}

      {deleteTarget && <DeleteResultDialog result={deleteTarget} onClose={() => setDeleteTarget(null)} />}
    </div>
  );
}
