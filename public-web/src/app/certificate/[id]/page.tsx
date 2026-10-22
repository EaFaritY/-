import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/components/PublicHeader";
import CertificateActions from "@/components/CertificateActions";
import ResultChip from "@/components/ResultChip";
import { getCertificateById } from "@/lib/search";

export default async function CertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const certificateId = Number(id);
  if (!Number.isInteger(certificateId)) notFound();

  const cert = await getCertificateById(certificateId);
  if (!cert) notFound();

  const downloadName = `certificate-${cert.studentId}-${cert.competitionName}.jpg`;

  return (
    <>
      <PublicHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="no-print mb-6">
            <Link href="/result" className="text-sm text-[var(--color-primary)] hover:underline">
              ← กลับไปหน้าผลการแข่งขัน
            </Link>
          </div>

          <div className="no-print mb-4 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white p-4">
            <div>
              <p className="font-medium text-[var(--color-text)]">
                {cert.firstName} {cert.lastName} · {cert.competitionName}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                รหัสนักเรียน {cert.studentId} · ชั้น {cert.class}/{cert.room}
              </p>
            </div>
            <ResultChip result={cert.result} />
          </div>

          <div className="print-area mb-6 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white p-4">
            <Image
              src={cert.filePath}
              alt={`ใบเกียรติบัตรของ ${cert.firstName} ${cert.lastName}`}
              width={1000}
              height={706}
              className="h-auto w-full rounded-md"
              priority
            />
          </div>

          <CertificateActions filePath={cert.filePath} downloadName={downloadName} />
        </div>
      </main>
    </>
  );
}
