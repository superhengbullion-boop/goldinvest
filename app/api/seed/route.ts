import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { execute, newId, queryOne } from "@/lib/db";
import { DEFAULT_PAGES, DEFAULT_RATES } from "@/lib/defaults";

export const dynamic = "force-dynamic";

const SEED_SECRET = "superhen-seed-2026";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (token !== SEED_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  try {
    // Admin user
    const email = "admin@goldinvest.local";
    const passwordHash = await bcrypt.hash("Admin123!", 12);
    await execute(
      `INSERT INTO \`User\`(\`id\`,\`email\`,\`passwordHash\`,\`name\`,\`createdAt\`,\`updatedAt\`)
       VALUES(?,?,?,'Administrator',NOW(3),NOW(3))
       ON DUPLICATE KEY UPDATE \`updatedAt\`=NOW(3)`,
      [newId(), email, passwordHash],
    );
    results.push("✓ admin user");

    // Pages
    for (const page of DEFAULT_PAGES) {
      const existing = await queryOne<{ id: string }>(
        "SELECT `id` FROM `Page` WHERE `slug`=? LIMIT 1",
        [page.slug],
      );
      if (!existing) {
        await execute(
          "INSERT INTO `Page`(`id`,`slug`,`title`,`description`,`content`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,NOW(3),NOW(3))",
          [newId(), page.slug, page.title, page.description ?? "", JSON.stringify(page.content)],
        );
        results.push(`✓ page: ${page.slug}`);
      } else {
        results.push(`- page already exists: ${page.slug}`);
      }
    }

    // Rates
    const rateCount = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM `Rate`");
    if (Number(rateCount?.total ?? 0) === 0) {
      for (const rate of DEFAULT_RATES) {
        await execute(
          "INSERT INTO `Rate`(`id`,`metal`,`product`,`unit`,`buyPrice`,`sellPrice`,`sortOrder`,`isActive`,`createdAt`,`updatedAt`) VALUES(?,?,?,?,?,?,?,1,NOW(3),NOW(3))",
          [newId(), rate.metal, rate.product, rate.unit ?? "RM / Gram", rate.buyPrice, rate.sellPrice, rate.sortOrder ?? 0],
        );
      }
      results.push(`✓ ${DEFAULT_RATES.length} rates`);
    } else {
      results.push("- rates already exist");
    }

    // RateRefreshTime
    const refreshCount = await queryOne<{ total: number }>("SELECT COUNT(*) AS total FROM `RateRefreshTime`");
    if (Number(refreshCount?.total ?? 0) === 0) {
      await execute("INSERT INTO `RateRefreshTime`(`id`,`time`,`createdAt`) VALUES(?,'06:30',NOW(3))", [newId()]);
      results.push("✓ rate refresh time");
    } else {
      results.push("- rate refresh time already exists");
    }

    return Response.json({ ok: true, results });
  } catch (err) {
    return Response.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
