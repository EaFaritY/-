"use client";

import { useActionState, useEffect, useRef } from "react";
import { CATEGORY_OPTIONS, type CompetitionListItem } from "@/lib/competitions-types";
import { createCompetitionAction, updateCompetitionAction, type CompetitionFormState } from "./actions";

const initialState: CompetitionFormState = {};

export default function CompetitionFormModal({
  competition,
  onClose,
}: {
  competition: CompetitionListItem | null;
  onClose: () => void;
}) {
  const isEdit = !!competition;
  const action = isEdit ? updateCompetitionAction : createCompetitionAction;
  const [state, formAction, isPending] = useActionState(action, initialState);
  const wasPending = useRef(false);

  // The action resolves with no error on success — close the modal once that
  // happens, after a submit had actually been in flight.
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
          {isEdit ? "แก้ไขรายการแข่งขัน" : "เพิ่มรายการแข่งขัน"}
        </h2>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={competition!.id} />}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ชื่อรายการแข่งขัน</span>
            <input
              name="name"
              type="text"
              defaultValue={competition?.name}
              required
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ประเภทกีฬา</span>
            <input
              name="sportType"
              type="text"
              defaultValue={competition?.sportType}
              placeholder="เช่น วิ่ง 100 เมตร"
              required
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ประเภทการแข่งขัน</span>
              <select
                name="category"
                defaultValue={competition?.category ?? CATEGORY_OPTIONS[0]}
                required
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">รุ่นอายุ (ถ้ามี)</span>
              <input
                name="ageGroup"
                type="text"
                defaultValue={competition?.ageGroup ?? ""}
                placeholder="เช่น รุ่นอายุ 12 ปี"
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">สีกีฬา</span>
            <input
              name="color"
              type="text"
              defaultValue={competition?.color}
              placeholder="เช่น สีแดง"
              required
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
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
