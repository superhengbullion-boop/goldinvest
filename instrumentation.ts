export async function register() {
  // Do not import Prisma here. On cPanel, loading the Prisma engine
  // during this hook crashes the process (open EEXIST).
  // The rate scheduler starts from lib/data.ts on the first page request.
}
