import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

// Serves certificate images from the directory shared by the public and admin
// sites (CERTIFICATE_UPLOAD_DIR). DB rows store paths like
// /uploads/certificates/<file>.jpg, so both sites resolve them identically.
// In production, replace this with an S3/R2/CDN URL instead.
const UPLOAD_DIR = path.resolve(
  process.env.CERTIFICATE_UPLOAD_DIR ?? path.join(/*turbopackIgnore: true*/ process.cwd(), "..", "shared-uploads", "certificates"),
);
const SAFE_NAME = /^[A-Za-z0-9._-]+\.jpe?g$/i;

export async function GET(_req: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  if (!SAFE_NAME.test(filename) || filename.includes("..")) {
    return new NextResponse("Not found", { status: 404 });
  }
  try {
    const data = await readFile(path.join(/*turbopackIgnore: true*/ UPLOAD_DIR, filename));
    return new NextResponse(new Uint8Array(data), {
      headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=3600" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
