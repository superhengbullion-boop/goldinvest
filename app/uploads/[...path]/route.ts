import { readFile } from "fs/promises";
import path from "path";
import { NextRequest } from "next/server";
import { getUploadFilePath } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
};

async function readUpload(safeName: string) {
  const paths = [
    getUploadFilePath(safeName),
    path.join(process.cwd(), "public", "uploads", path.basename(safeName)),
  ];
  for (const filePath of paths) {
    try {
      return await readFile(filePath);
    } catch {
      // try next location (legacy public/uploads)
    }
  }
  return null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const safeName = segments.map((s) => path.basename(s)).join("/");

  const file = await readUpload(safeName);
  if (!file) return new Response("Not found", { status: 404 });

  const ext = path.extname(safeName).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  return new Response(file, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
