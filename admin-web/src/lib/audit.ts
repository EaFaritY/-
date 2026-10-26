import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export interface AuditEntry {
  adminId: number;
  action: "create" | "update" | "delete" | "import" | "export" | "login" | "logout";
  targetType: string;
  targetId?: number | null;
  details?: unknown;
}

export async function logAudit(entry: AuditEntry) {
  await db.insert(auditLogs).values({
    adminId: entry.adminId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId ?? null,
    details: entry.details ?? null,
  });
}
