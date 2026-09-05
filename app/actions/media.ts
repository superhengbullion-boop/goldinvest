"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSession } from "@/lib/session";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "video/mp4": "mp4",
};

export async function uploadMedia(formData: FormData) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose a file.");
  }
  if (!ALLOWED.has(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, GIF, or MP4 file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("File must be 8MB or smaller.");
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${EXT[file.type]}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/uploads/${name}`;
}
