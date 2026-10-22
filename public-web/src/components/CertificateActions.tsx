"use client";

export default function CertificateActions({ filePath, downloadName }: { filePath: string; downloadName: string }) {
  return (
    <div className="no-print flex flex-wrap items-center justify-center gap-3">
      <a
        href={filePath}
        download={downloadName}
        className="inline-flex items-center gap-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
      >
        ดาวน์โหลด (JPG)
      </a>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--color-primary)] px-4 py-2 text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
      >
        พิมพ์ / บันทึกเป็น PDF
      </button>
    </div>
  );
}
