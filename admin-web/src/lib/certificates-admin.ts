import "server-only";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { certificates } from "@/db/schema";
import { saveCertificateFile, deleteCertificateFile } from "./storage";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_DIMENSION = 2000; // px, longest side
const JPEG_QUALITY = 88;

export class InvalidCertificateFileError extends Error {}

/**
 * Validates, compresses, and stores an uploaded certificate image, then
 * writes (or replaces) the corresponding `certificates` row for a result.
 * Only one certificate is kept per result: any existing certificate row
 * and file for this result is deleted first.
 */
export async function processAndSaveCertificate(resultId: number, file: File) {
  if (file.size === 0) {
    throw new InvalidCertificateFileError("ไฟล์ว่างเปล่า");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new InvalidCertificateFileError("ไฟล์มีขนาดใหญ่เกิน 8MB");
  }

  const inputBuffer = Buffer.from(await file.arrayBuffer());

  let image = sharp(inputBuffer, { failOn: "none" });
  let metadata: Awaited<ReturnType<typeof image.metadata>>;
  try {
    metadata = await image.metadata();
  } catch {
    throw new InvalidCertificateFileError("ไม่สามารถอ่านไฟล์รูปภาพนี้ได้");
  }

  // sharp always reports the decoder name as "jpeg" (never "jpg") regardless
  // of the uploaded file's extension.
  if (metadata.format !== "jpeg") {
    throw new InvalidCertificateFileError("รองรับเฉพาะไฟล์ JPG/JPEG เท่านั้น");
  }

  // Auto-rotate based on EXIF orientation before measuring/resizing.
  image = image.rotate();

  const resized = image.resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: "inside",
    withoutEnlargement: true,
  });

  const outputBuffer = await resized.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toBuffer();
  const outputMeta = await sharp(outputBuffer).metadata();

  // Remove any existing certificate for this result (file + row) first,
  // so a result never ends up with more than one certificate.
  const [existing] = await db
    .select()
    .from(certificates)
    .where(eq(certificates.studentResultId, resultId))
    .limit(1);
  if (existing) {
    await deleteCertificateFile(existing.filePath);
    await db.delete(certificates).where(eq(certificates.id, existing.id));
  }

  const filename = `cert-${resultId}-${Date.now()}.jpg`;
  const filePath = await saveCertificateFile(filename, outputBuffer);

  const [row] = await db
    .insert(certificates)
    .values({
      studentResultId: resultId,
      filePath,
      fileType: "image/jpeg",
      originalFilename: file.name || filename,
      fileSizeBytes: outputBuffer.length,
      widthPx: outputMeta.width ?? null,
      heightPx: outputMeta.height ?? null,
    })
    .returning();

  return row;
}

export async function removeCertificate(certificateId: number) {
  const [row] = await db.select().from(certificates).where(eq(certificates.id, certificateId)).limit(1);
  if (!row) return null;
  await deleteCertificateFile(row.filePath);
  await db.delete(certificates).where(eq(certificates.id, certificateId));
  return row;
}
