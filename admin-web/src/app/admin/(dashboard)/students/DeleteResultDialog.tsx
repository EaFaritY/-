"use client";

import { useState, useTransition } from "react";
import type { StudentResultItem } from "@/lib/students-types";
import { deleteResultAction } from "./actions";

export default function DeleteResultDialog({ result, onClose }: { result: StudentResultItem; onClose: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const res = await deleteResultAction(result.resultId);
      if (res.error) {
        setError(res.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-2 text-lg font-bold text-[var(--color-text)]">ลบผลการแข่งขัน</h2>
        <p className="text-sm text-[var(--color-text-muted)]">
          ต้องการลบผลการแข่งขัน &ldquo;{result.competitionName}&rdquo; ใช่หรือไม่? ใบเกียรติบัตรที่แนบไว้จะถูกลบไปด้วย
          และไม่สามารถย้อนกลับได้
        </p>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? "กำลังลบ..." : "ลบ"}
          </button>
        </div>
      </div>
    </div>
  );
}
