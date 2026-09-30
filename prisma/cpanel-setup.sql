-- Import this in cPanel phpMyAdmin (select database superhen_gold_invest first).
-- Do NOT run "db:generate" on this host — Prisma CLI crashes there.
--
-- After import, login at /admin/login
--   email: admin@goldinvest.local
--   password: ChangeMe123!
-- Then change the password.

CREATE TABLE IF NOT EXISTS `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Page` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `content` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Rate` (
    `id` VARCHAR(191) NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `product` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'RM / Gram',
    `buyPrice` DECIMAL(12, 2) NOT NULL,
    `sellPrice` DECIMAL(12, 2) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `MetalQuote` (
    `id` VARCHAR(191) NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `price` DECIMAL(16, 6) NOT NULL,
    `bid` DECIMAL(16, 6) NULL,
    `ask` DECIMAL(16, 6) NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'troy_ounce',
    `priceGram` DECIMAL(16, 6) NULL,
    `priceKg` DECIMAL(16, 6) NULL,
    `priceTael` DECIMAL(16, 6) NULL,
    `melt24k` DECIMAL(16, 6) NULL,
    `melt22k` DECIMAL(16, 6) NULL,
    `melt21k` DECIMAL(16, 6) NULL,
    `melt18k` DECIMAL(16, 6) NULL,
    `change` DECIMAL(12, 6) NULL,
    `changePercent` DECIMAL(8, 4) NULL,
    `raw` JSON NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `MetalQuote_metal_currency_key`(`metal`, `currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RateRefreshTime` (
    `id` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `RateRefreshTime_time_key`(`time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RateFetchLog` (
    `slotKey` VARCHAR(191) NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `ok` BOOLEAN NOT NULL DEFAULT true,
    `error` TEXT NULL,
    PRIMARY KEY (`slotKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RateBook` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RateBookAdj` (
    `id` VARCHAR(191) NOT NULL,
    `bookId` VARCHAR(191) NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `unitKey` VARCHAR(191) NOT NULL,
    `buyDelta` DECIMAL(16, 6) NOT NULL DEFAULT 0,
    `sellDelta` DECIMAL(16, 6) NOT NULL DEFAULT 0,
    UNIQUE INDEX `RateBookAdj_bookId_metal_unitKey_key`(`bookId`, `metal`, `unitKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Member` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `rateBookId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Member_memberId_key`(`memberId`),
    UNIQUE INDEX `Member_username_key`(`username`),
    UNIQUE INDEX `Member_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `RateBookAdj`
  ADD CONSTRAINT `RateBookAdj_bookId_fkey`
  FOREIGN KEY (`bookId`) REFERENCES `RateBook`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Member`
  ADD CONSTRAINT `Member_rateBookId_fkey`
  FOREIGN KEY (`rateBookId`) REFERENCES `RateBook`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `CartItem` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` INTEGER NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `unitKey` VARCHAR(191) NOT NULL DEFAULT 'myr-kg',
    `side` VARCHAR(191) NOT NULL DEFAULT 'buy',
    `lockedPrice` DECIMAL(16, 6) NOT NULL,
    `qtyKg` DECIMAL(16, 6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `CartItem_memberId_metal_unitKey_side_key`(`memberId`, `metal`, `unitKey`, `side`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Order` (
    `id` VARCHAR(191) NOT NULL,
    `orderNo` VARCHAR(191) NOT NULL,
    `memberId` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `totalAmount` DECIMAL(16, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Order_orderNo_key`(`orderNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `unitKey` VARCHAR(191) NOT NULL DEFAULT 'myr-kg',
    `side` VARCHAR(191) NOT NULL DEFAULT 'buy',
    `lockedPrice` DECIMAL(16, 6) NOT NULL,
    `qtyKg` DECIMAL(16, 6) NOT NULL,
    `lineTotal` DECIMAL(16, 2) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CartItem`
  ADD CONSTRAINT `CartItem_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Order`
  ADD CONSTRAINT `Order_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
  ADD CONSTRAINT `OrderItem_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS `_prisma_migrations` (
    `id` VARCHAR(36) NOT NULL,
    `checksum` VARCHAR(64) NOT NULL,
    `finished_at` DATETIME(3) NULL,
    `migration_name` VARCHAR(255) NOT NULL,
    `logs` TEXT NULL,
    `rolled_back_at` DATETIME(3) NULL,
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `applied_steps_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `applied_steps_count`) VALUES
('cpanel-1', '4a82731b0fb6bb63096820489e15d1668d2fa4d50ce46a382369c5a9bdfcc4ca', NOW(3), '20260831073141_test', 1),
('cpanel-2', '6bceda09e8a65bc17ba9b7ec7a8566483231870b409667f3d4f18ff1026e75a6', NOW(3), '20260831074110_cms_auth_rates', 1),
('cpanel-3', '2094c46f76e16d1c39993b51d51462fa62bea06d9990fb412bbeb59809392eea', NOW(3), '20260831084227_goldapi_quotes', 1),
('cpanel-4', 'bb316bdcb68ef13edeafddf60c979736cffa6b8b431f900ae6c6ee862d8118b5', NOW(3), '20260831085013_metal_quote_myr_units', 1),
('cpanel-5', 'eb2796873bdc36ada8ef70a8a8decdb788adfd5b34c1e5e0cfc326d7b9488f9d', NOW(3), '20260831091950_rate_books', 1),
('cpanel-6', '45ff60ec3d27ff7d0a54a337738d4a6c8228289de0f6ed0965431bbacaeb0137', NOW(3), '20260831140000_members_portal', 1);

INSERT INTO `User` (`id`, `email`, `passwordHash`, `name`, `createdAt`, `updatedAt`)
VALUES (
  'admin_cpanel_001',
  'admin@goldinvest.local',
  '$2b$12$fWTFZC2oTi7mvtbSUJnJ1eZVEs3h5kBp56DZx02YHzdtKqsNccFXa',
  'Administrator',
  NOW(3),
  NOW(3)
);

INSERT INTO `RateRefreshTime` (`id`, `time`, `createdAt`)
VALUES ('refresh_0630', '06:30', NOW(3));
