import { COLORS, RESULT_META, SCHOOL_NAME, type ResultKey } from "./theme";

export interface CertificateData {
  fullName: string;
  studentId: string;
  classRoom: string;
  competitionName: string;
  color: string;
  result: ResultKey;
}

/** Raw SVG markup for a certificate. Rasterized to JPG via sharp at upload/seed time. */
export function renderCertificateSvg(data: CertificateData): string {
  const meta = RESULT_META[data.result];
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const font = "Waree, 'Noto Sans Thai', sans-serif";

  return `<svg viewBox="0 0 850 600" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="0" width="850" height="600" fill="#FFFFFF" />
    <rect x="24" y="24" width="802" height="552" fill="none" stroke="${meta.border}" stroke-width="3" />
    <rect x="34" y="34" width="782" height="532" fill="none" stroke="${COLORS.primaryLight}" stroke-width="1" />
    <circle cx="60" cy="60" r="4" fill="${meta.border}" />
    <circle cx="790" cy="60" r="4" fill="${meta.border}" />
    <circle cx="60" cy="540" r="4" fill="${meta.border}" />
    <circle cx="790" cy="540" r="4" fill="${meta.border}" />

    <text x="425" y="95" text-anchor="middle" font-size="16" fill="${COLORS.textMuted}" font-family="${font}">${esc(SCHOOL_NAME)}</text>
    <text x="425" y="150" text-anchor="middle" font-size="34" font-weight="700" fill="${COLORS.primaryDark}" font-family="${font}">ใบเกียรติบัตร</text>
    <text x="425" y="185" text-anchor="middle" font-size="15" fill="${COLORS.textMuted}" font-family="${font}">มอบให้เพื่อแสดงว่า</text>

    <text x="425" y="250" text-anchor="middle" font-size="30" font-weight="700" fill="${COLORS.text}" font-family="${font}">${esc(data.fullName)}</text>
    <text x="425" y="280" text-anchor="middle" font-size="14" fill="${COLORS.textMuted}" font-family="${font}">รหัสนักเรียน ${esc(data.studentId)} · ชั้น ${esc(data.classRoom)}</text>

    <text x="425" y="335" text-anchor="middle" font-size="17" fill="${COLORS.text}" font-family="${font}">ได้รับรางวัล</text>
    <text x="425" y="378" text-anchor="middle" font-size="26" font-weight="700" fill="${meta.fg}" font-family="${font}">${meta.emoji} ${esc(meta.label)}</text>
    <text x="425" y="410" text-anchor="middle" font-size="17" fill="${COLORS.text}" font-family="${font}">ในการแข่งขัน${esc(data.competitionName)} (${esc(data.color)})</text>

    <line x1="180" y1="500" x2="340" y2="500" stroke="${COLORS.border}" stroke-width="1" />
    <text x="260" y="522" text-anchor="middle" font-size="12" fill="${COLORS.textMuted}" font-family="${font}">ผู้อำนวยการโรงเรียน</text>
    <line x1="510" y1="500" x2="670" y2="500" stroke="${COLORS.border}" stroke-width="1" />
    <text x="590" y="522" text-anchor="middle" font-size="12" fill="${COLORS.textMuted}" font-family="${font}">วันที่ประกาศผล</text>
  </svg>`;
}
