import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

/**
 * Local-disk storage for development. Swap the body of these functions for
 * S3/R2 calls (e.g. @aws-sdk/client-s3 PutObjectCommand + a CDN URL builder)
 * when moving to production — nothing outside this file needs to change,
 * since every call site only knows about these three function names.
 */
// Shared with the public site, which serves these files read-only. Both apps
// must point CERTIFICATE_UPLOAD_DIR at the same directory (or swap this module
// for S3/R2 in production).
const UPLOAD_DIR = path.resolve(
  process.env.CERTIFICATE_UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "..", "shared-uploads", "certificates"),
);

export async function saveCertificateFile(filename: string, buffer: Buffer): Promise<string> {
  await mkdir(/*turbopackIgnore: true*/ UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename), buffer);
  return `/uploads/certificates/${filename}`;
}

export function certificateUrl(filePath: string): string {
  // filePath is already a servable public path in this local implementation.
  return filePath;
}

export async function deleteCertificateFile(filePath: string): Promise<void> {
  // filePath is a public URL path like /uploads/certificates/xyz.jpg; map it
  // back to a disk path under the same uploads directory this module owns.
  const filename = path.basename(filePath);
  try {
    await unlink(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename));
  } catch (err: unknown) {
    // Already gone is fine; anything else is worth knowing about even though
    // we don't want a missing file to block the surrounding DB operation.
    if (!(err && typeof err === "object" && "code" in err && err.code === "ENOENT")) {
      console.error("Failed to delete certificate file:", filePath, err);
    }
  }
}
