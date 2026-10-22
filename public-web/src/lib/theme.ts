// Design tokens — pinned by the client's brief (white + blue school theme).
export const COLORS = {
  primary: "#1565C0",
  primaryDark: "#0D47A1",
  primaryLight: "#E3F2FD",
  bg: "#F7F9FC",
  white: "#FFFFFF",
  text: "#1B2430",
  textMuted: "#5B6472",
  border: "#E2E8F0",
} as const;

export type ResultKey = "winner" | "runner_up" | "second_runner_up" | "honorable_mention" | "participated";

export const RESULT_META: Record<ResultKey, { label: string; emoji: string; bg: string; fg: string; border: string }> = {
  winner: { label: "ชนะเลิศ", emoji: "🥇", bg: "#FDF3D8", fg: "#8A6A00", border: "#E6C767" },
  runner_up: { label: "รองชนะเลิศ", emoji: "🥈", bg: "#EEF1F5", fg: "#5B6472", border: "#C7CEDA" },
  second_runner_up: { label: "รองชนะเลิศอันดับ 2", emoji: "🥉", bg: "#F7E9DD", fg: "#8A4B1E", border: "#E0B48B" },
  honorable_mention: { label: "รางวัลชมเชย", emoji: "🏅", bg: COLORS.primaryLight, fg: COLORS.primaryDark, border: "#BBDEFB" },
  participated: { label: "เข้าร่วมการแข่งขัน", emoji: "—", bg: "#F1F5F9", fg: "#64748B", border: "#E2E8F0" },
};

export const SCHOOL_NAME = "โรงเรียนตัวอย่างวิทยา";
export const EVENT_NAME = "ระบบค้นหารางวัลกีฬาสี ประจำปีการศึกษา 2569";
export const CURRENT_ACADEMIC_YEAR_BE = 2569;
