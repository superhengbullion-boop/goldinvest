ALTER TABLE `Member`
  ADD COLUMN `xauGrams` DECIMAL(16, 6) NOT NULL DEFAULT 0,
  ADD COLUMN `fundMyr` DECIMAL(16, 2) NOT NULL DEFAULT 0;

CREATE TABLE `Deposit` (
  `id` VARCHAR(191) NOT NULL,
  `memberId` INTEGER NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
  `comment` TEXT NULL,
  `proofPath` VARCHAR(191) NULL,
  `creditedAmount` DECIMAL(16, 6) NULL,
  `reviewedBy` VARCHAR(191) NULL,
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `Deposit_status_idx`(`status`),
  INDEX `Deposit_memberId_idx`(`memberId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Deposit`
  ADD CONSTRAINT `Deposit_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
