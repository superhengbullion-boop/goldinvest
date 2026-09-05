import "dotenv/config";
import bcrypt from "bcryptjs";
import { DEFAULT_PAGES, DEFAULT_RATES } from "../lib/defaults";
import { prisma } from "../lib/prisma";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@goldinvest.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name: "Administrator" },
    create: { email, passwordHash, name: "Administrator" },
  });

  for (const page of DEFAULT_PAGES) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        description: page.description,
        content: page.content,
      },
    });
  }

  const rateCount = await prisma.rate.count();
  if (rateCount === 0) {
    await prisma.rate.createMany({ data: DEFAULT_RATES });
  }

  const refreshCount = await prisma.rateRefreshTime.count();
  if (refreshCount === 0) {
    await prisma.rateRefreshTime.create({ data: { time: "06:30" } });
  }

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
