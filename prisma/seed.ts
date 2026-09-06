import "dotenv/config";
import bcrypt from "bcryptjs";
import { disconnectDb, execute, newId, queryOne } from "../lib/db";
import { DEFAULT_PAGES, DEFAULT_RATES } from "../lib/defaults";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@goldinvest.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const passwordHash = await bcrypt.hash(password, 12);

  await execute(
    `INSERT INTO \`User\`(\`id\`,\`email\`,\`passwordHash\`,\`name\`,\`createdAt\`,\`updatedAt\`)
     VALUES(?,?,?,'Administrator',NOW(3),NOW(3))
     ON DUPLICATE KEY UPDATE \`passwordHash\`=VALUES(\`passwordHash\`),\`name\`=VALUES(\`name\`),\`updatedAt\`=NOW(3)`,
    [newId(), email, passwordHash],
  );

  for (const page of DEFAULT_PAGES) {
    const existing = await queryOne<{ id: string }>(
      "SELECT `id` FROM `Page` WHERE `slug`=? LIMIT 1", [page.slug],
    );
    if (!existing) {
      await execute(
        "INSERT INTO `Page`(`id`,`slug`,`title`,`description`,`content`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,NOW(3),NOW(3))",
        [newId(), page.slug, page.title, page.description, JSON.stringify(page.content)],
      );
    }
  }

  const rateCount = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM `Rate`");
  if (Number(rateCount?.total ?? 0) === 0) {
    for (const rate of DEFAULT_RATES) {
      await execute(
        "INSERT INTO `Rate`(`id`,`metal`,`product`,`unit`,`buyPrice`,`sellPrice`,`sortOrder`,`isActive`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,?,?,1,NOW(3),NOW(3))",
        [newId(), rate.metal, rate.product, rate.unit ?? "RM / Gram", rate.buyPrice, rate.sellPrice, rate.sortOrder ?? 0],
      );
    }
  }

  const refreshCount = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM `RateRefreshTime`");
  if (Number(refreshCount?.total ?? 0) === 0) {
    await execute("INSERT INTO `RateRefreshTime`(`id`,`time`,`createdAt`) VALUES(?,'06:30',NOW(3))", [newId()]);
  }

  console.log(`Admin ready: ${email}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await disconnectDb(); });
