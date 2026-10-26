"use server";

import { revalidatePath } from "next/cache";
import { getCurrentAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import {
  createStudent,
  updateStudent,
  deleteStudent,
  DuplicateStudentIdError,
  addResult,
  updateResult,
  deleteResult,
  DuplicateResultError,
  type StudentInput,
} from "@/lib/students";
import { processAndSaveCertificate, removeCertificate, InvalidCertificateFileError } from "@/lib/certificates-admin";

export interface StudentFormState {
  error?: string;
}
export interface ResultFormState {
  error?: string;
}
export interface CertificateFormState {
  error?: string;
}

function parseStudentInput(formData: FormData): StudentInput {
  return {
    studentId: String(formData.get("studentId") ?? "").trim(),
    firstName: String(formData.get("firstName") ?? "").trim(),
    lastName: String(formData.get("lastName") ?? "").trim(),
    class: String(formData.get("class") ?? "").trim(),
    room: String(formData.get("room") ?? "").trim(),
  };
}

function validateStudent(input: StudentInput): string | null {
  if (!input.studentId) return "กรุณากรอกรหัสนักเรียน";
  if (!input.firstName) return "กรุณากรอกชื่อ";
  if (!input.lastName) return "กรุณากรอกนามสกุล";
  if (!input.class) return "กรุณากรอกชั้น";
  if (!input.room) return "กรุณากรอกห้อง";
  return null;
}

export async function createStudentAction(_prevState: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const input = parseStudentInput(formData);
  const validationError = validateStudent(input);
  if (validationError) return { error: validationError };

  try {
    const row = await createStudent(input);
    await logAudit({ adminId: admin.adminId, action: "create", targetType: "student", targetId: row.id, details: input });
  } catch (err) {
    if (err instanceof DuplicateStudentIdError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/students");
  return {};
}

export async function updateStudentAction(_prevState: StudentFormState, formData: FormData): Promise<StudentFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id)) return { error: "ไม่พบนักเรียนคนนี้" };

  const input = parseStudentInput(formData);
  const validationError = validateStudent(input);
  if (validationError) return { error: validationError };

  try {
    const row = await updateStudent(id, input);
    if (!row) return { error: "ไม่พบนักเรียนคนนี้" };
    await logAudit({ adminId: admin.adminId, action: "update", targetType: "student", targetId: id, details: input });
  } catch (err) {
    if (err instanceof DuplicateStudentIdError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/students");
  return {};
}

export async function deleteStudentAction(id: number): Promise<StudentFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const row = await deleteStudent(id);
  if (!row) return { error: "ไม่พบนักเรียนคนนี้" };

  await logAudit({ adminId: admin.adminId, action: "delete", targetType: "student", targetId: id });
  revalidatePath("/admin/students");
  return {};
}

export async function addResultAction(_prevState: ResultFormState, formData: FormData): Promise<ResultFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const studentDbId = Number(formData.get("studentDbId"));
  const competitionId = Number(formData.get("competitionId"));
  const result = String(formData.get("result") ?? "");

  if (!Number.isInteger(studentDbId)) return { error: "ไม่พบนักเรียนคนนี้" };
  if (!Number.isInteger(competitionId)) return { error: "กรุณาเลือกรายการแข่งขัน" };
  if (!result) return { error: "กรุณาเลือกผลการแข่งขัน" };

  try {
    const row = await addResult(studentDbId, competitionId, result);
    await logAudit({
      adminId: admin.adminId,
      action: "create",
      targetType: "student_result",
      targetId: row.id,
      details: { studentDbId, competitionId, result },
    });
  } catch (err) {
    if (err instanceof DuplicateResultError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/students");
  return {};
}

export async function updateResultAction(_prevState: ResultFormState, formData: FormData): Promise<ResultFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const resultId = Number(formData.get("resultId"));
  const competitionId = Number(formData.get("competitionId"));
  const result = String(formData.get("result") ?? "");

  if (!Number.isInteger(resultId)) return { error: "ไม่พบผลการแข่งขันนี้" };
  if (!Number.isInteger(competitionId)) return { error: "กรุณาเลือกรายการแข่งขัน" };
  if (!result) return { error: "กรุณาเลือกผลการแข่งขัน" };

  try {
    const row = await updateResult(resultId, competitionId, result);
    if (!row) return { error: "ไม่พบผลการแข่งขันนี้" };
    await logAudit({
      adminId: admin.adminId,
      action: "update",
      targetType: "student_result",
      targetId: resultId,
      details: { competitionId, result },
    });
  } catch (err) {
    if (err instanceof DuplicateResultError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/students");
  return {};
}

export async function deleteResultAction(resultId: number): Promise<ResultFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const row = await deleteResult(resultId);
  if (!row) return { error: "ไม่พบผลการแข่งขันนี้" };

  await logAudit({ adminId: admin.adminId, action: "delete", targetType: "student_result", targetId: resultId });
  revalidatePath("/admin/students");
  return {};
}

export async function uploadCertificateAction(
  _prevState: CertificateFormState,
  formData: FormData
): Promise<CertificateFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const resultId = Number(formData.get("resultId"));
  const file = formData.get("file");

  if (!Number.isInteger(resultId)) return { error: "ไม่พบผลการแข่งขันนี้" };
  if (!(file instanceof File) || file.size === 0) return { error: "กรุณาเลือกไฟล์ใบเกียรติบัตร" };

  try {
    const row = await processAndSaveCertificate(resultId, file);
    await logAudit({
      adminId: admin.adminId,
      action: "update",
      targetType: "certificate",
      targetId: row.id,
      details: { resultId, originalFilename: file.name },
    });
  } catch (err) {
    if (err instanceof InvalidCertificateFileError) return { error: err.message };
    throw err;
  }

  revalidatePath("/admin/students");
  return {};
}

export async function deleteCertificateAction(certificateId: number): Promise<CertificateFormState> {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };

  const row = await removeCertificate(certificateId);
  if (!row) return { error: "ไม่พบใบเกียรติบัตรนี้" };

  await logAudit({ adminId: admin.adminId, action: "delete", targetType: "certificate", targetId: certificateId });
  revalidatePath("/admin/students");
  return {};
}
