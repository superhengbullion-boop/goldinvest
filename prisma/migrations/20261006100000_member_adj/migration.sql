-- Per-member buy/sell overrides on top of (optional) rate book

CREATE TABLE `MemberAdj` (
    `id` VARCHAR(191) NOT NULL,
    `memberId` INTEGER NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `unitKey` VARCHAR(191) NOT NULL,
    `buyDelta` DECIMAL(16, 6) NULL,
    `sellDelta` DECIMAL(16, 6) NULL,
    UNIQUE INDEX `MemberAdj_memberId_metal_unitKey_key`(`memberId`, `metal`, `unitKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `MemberAdj`
  ADD CONSTRAINT `MemberAdj_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
