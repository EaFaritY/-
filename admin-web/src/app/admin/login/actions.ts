"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { createSessionToken, getCurrentAdmin, SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS } from "@/lib/auth";
import { logAudit } from "@/lib/audit";

// Precomputed once so a login attempt against a username that doesn't exist
// takes roughly as long as one against a real username with a wrong
// password — otherwise response timing would leak which usernames exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export interface LoginState {
  error?: string;
}

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!username || !password) {
    return { error: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
  }

  const [admin] = await db.select().from(admins).where(eq(admins.username, username)).limit(1);

  const hashToCompare = admin?.passwordHash ?? DUMMY_HASH;
  const isValid = await bcrypt.compare(password, hashToCompare);

  if (!admin || !admin.isActive || !isValid) {
    return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
  }

  const token = await createSessionToken({ adminId: admin.id, username: admin.username, role: admin.role });
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, SESSION_COOKIE_OPTIONS);

  await logAudit({ adminId: admin.id, action: "login", targetType: "admin", targetId: admin.id });

  redirect("/admin");
}

export async function logoutAction() {
  const admin = await getCurrentAdmin();
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);

  if (admin) {
    await logAudit({ adminId: admin.adminId, action: "logout", targetType: "admin", targetId: admin.adminId });
  }

  redirect("/admin/login");
}
