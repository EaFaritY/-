import { RESULT_META, type ResultKey } from "@/lib/theme";

export default function ResultChip({ result }: { result: string }) {
  const meta = RESULT_META[result as ResultKey] ?? RESULT_META.participated;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: meta.bg, color: meta.fg, borderColor: meta.border }}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
