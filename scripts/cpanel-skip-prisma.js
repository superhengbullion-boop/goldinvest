console.log(
  [
    "Do not run Prisma CLI (db:generate / db:migrate) on this cPanel host.",
    "It crashes because CloudLinux blocks Prisma's WASM engine.",
    "",
    "Create tables instead:",
    "1. cPanel → phpMyAdmin → select your database",
    "2. Import → choose prisma/cpanel-setup.sql → Go",
    "3. Then run the build script (not db:generate).",
    "",
    "Admin login after import:",
    "  email: admin@goldinvest.local",
    "  password: ChangeMe123!",
  ].join("\n"),
);
