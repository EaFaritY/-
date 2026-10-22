"use client";

import { useActionState, useEffect, useRef } from "react";
import type { StudentListItem } from "@/lib/students-types";
import { createStudentAction, updateStudentAction, type StudentFormState } from "./actions";

const initialState: StudentFormState = {};

export default function StudentFormModal({
  student,
  onClose,
}: {
  student: StudentListItem | null;
  onClose: () => void;
}) {
  const isEdit = !!student;
  const action = isEdit ? updateStudentAction : createStudentAction;
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
        <h2 className="mb-4 text-lg font-bold text-[var(--color-text)]">{isEdit ? "แก้ไขข้อมูลนักเรียน" : "เพิ่มนักเรียน"}</h2>

        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={student!.id} />}

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">รหัสนักเรียน</span>
            <input
              name="studentId"
              type="text"
              defaultValue={student?.studentId}
              required
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ชื่อ</span>
              <input
                name="firstName"
                type="text"
                defaultValue={student?.firstName}
                required
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">นามสกุล</span>
              <input
                name="lastName"
                type="text"
                defaultValue={student?.lastName}
                required
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ชั้น</span>
              <input
                name="class"
                type="text"
                defaultValue={student?.class}
                placeholder="เช่น 5"
                required
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--color-text)]">ห้อง</span>
              <input
                name="room"
                type="text"
                defaultValue={student?.room}
                placeholder="เช่น 2"
                required
                className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-light)]"
              />
            </label>
          </div>

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
