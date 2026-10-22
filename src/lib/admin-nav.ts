import {
  LayoutDashboard,
  Users,
  Trophy,
  Award,
  Image as ImageIcon,
  FileUp,
  FileSpreadsheet,
  FileDown,
  ShieldCheck,
  ScrollText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const SIDEBAR_ITEMS: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/students", label: "นักเรียน", icon: Users },
  { href: "/admin/competitions", label: "รายการแข่งขัน", icon: Trophy },
  { href: "/admin/results", label: "ผลการแข่งขัน", icon: Award },
  { href: "/admin/certificates", label: "ใบเกียรติบัตร", icon: ImageIcon },
  { href: "/admin/import-excel", label: "Import Excel", icon: FileUp },
  { href: "/admin/import-sheets", label: "Import Google Sheets", icon: FileSpreadsheet },
  { href: "/admin/export", label: "Export", icon: FileDown },
  { href: "/admin/admins", label: "ผู้ดูแลระบบ", icon: ShieldCheck },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ScrollText },
  { href: "/admin/settings", label: "ตั้งค่าระบบ", icon: Settings },
];
