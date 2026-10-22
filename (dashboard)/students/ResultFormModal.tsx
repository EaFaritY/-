"use client";

import { useActionState, useEffect, useRef } from "react";
import { RESULT_META, type ResultKey } from "@/lib/theme";
import type { CompetitionOption, StudentResultItem } from "@/lib/students-types";
import { addResultAction, updateResultAction, type ResultFormState } from "./actions";

const RESULT_ORDER: ResultKey[] = ["winner", "runner_up", "second_runner_up", "honorable_mention", "participated"];

const initialState: ResultFormState = {};

export default function ResultFormModal({
  studentDbId,
  competitionOptions,
  existingResult,
  onClose,
}: {
  studentDbId: number;
  competitionOptions: CompetitionOption[];
  existingResult: StudentResultItem | null;
  onClose: () => void;
}) {
  const isEdit = !!existingResult;
  const action = isEdit ? updateResultAction : addResultAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !isPending && !state.error) {
      onClose();
    }
    wasPending.current = isPending;
  }, [isPending, state.error, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">
          {isEdit ? "แก้ไขผลการแข่งขัน" : "เพิ่มผลการแข่งขัน"}
        </h2>

        <form action={formAction} className="space-y-4">
          {isEdit ? (
            <input type="hidden" name="resultId" value={existingResult!.resultId} />
          ) : (
            <input type="hidden" name="studentDbId" value={studentDbId} />
          )}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">รายการแข่งขัน</span>
            <select
              name="competitionId"
              defaultValue={existingResult?.competitionId}
              required
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="">— เลือกรายการแข่งขัน —</option>
              {competitionOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.color})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ผลการแข่งขัน</span>
            <select
              name="result"
              defaultValue={existingResult?.result ?? ""}
              required
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            >
              <option value="">— เลือกผลการแข่งขัน —</option>
              {RESULT_ORDER.map((key) => (
                <option key={key} value={key}>
                  {RESULT_META[key].emoji} {RESULT_META[key].label}
                </option>
              ))}
            </select>
          </label>

          {state.error && <p className="text-sm text-red-600">{state.error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg)]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
            >
              {isPending ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
