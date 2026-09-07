import path from "path";

/** Writable upload dir at repo root (better for cPanel than public/uploads). */
export function getUploadsDir() {
  return path.join(process.cwd(), "uploads");
}

export function getUploadFilePath(name: string) {
  return path.join(getUploadsDir(), path.basename(name));
}
