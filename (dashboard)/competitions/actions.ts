"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { createCompetition, updateCompetition, deleteCompetition, type CompetitionInput } from "@/lib/competitions";

export interface CompetitionFormState {
  error?: string;
}

function parseInput(formData: FormData): CompetitionInput {
  return {
    name: String(formData.get("name") ?? "").trim(),
    sportType: String(formData.get("sportType") ?? "").trim(),
    category: String(formData.get("category") ?? "").trim(),
    ageGroup: String(formData.get("ageGroup") ?? "").trim(),
    color: String(formData.get("color") ?? "").trim(),
  };
}

function validate(input: CompetitionInput): string | null {
  if (!input.name) return "กรุณากรอกชื่อรายการแข่งขัน";
  if (!input.sportType) return "กรุณากรอกประเภทกีฬา";
  if (!input.category) return "กรุณาเลือกประเภทการแข่งขัน";
  if (!input.color) return "กรุณากรอกสีกีฬา";
  return null;
}

export async function createCompetitionAction(
  _prevState: CompetitionFormState,
  formData: FormData
): Promise<CompetitionFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const input = parseInput(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const row = await createCompetition(input);
  await logAudit({ adminId: admin.adminId, action: "create", targetType: "competition", targetId: row.id, details: input });

  revalidatePath("/admin/competitions");
  return {};
}

export async function updateCompetitionAction(
  _prevState: CompetitionFormState,
  formData: FormData
): Promise<CompetitionFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "ไม่พบรายการแข่งขันนี้" };

  const input = parseInput(formData);
  const validationError = validate(input);
  if (validationError) return { error: validationError };

  const row = await updateCompetition(id, input);
  if (!row) return { error: "ไม่พบรายการแข่งขันนี้" };

  await logAudit({ adminId: admin.adminId, action: "update", targetType: "competition", targetId: id, details: input });

  revalidatePath("/admin/competitions");
  return {};
}

export async function deleteCompetitionAction(id: number): Promise<CompetitionFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const row = await deleteCompetition(id);
  if (!row) return { error: "ไม่พบรายการแข่งขันนี้" };

  await logAudit({ adminId: admin.adminId, action: "delete", targetType: "competition", targetId: id });

  revalidatePath("/admin/competitions");
  return {};
}
