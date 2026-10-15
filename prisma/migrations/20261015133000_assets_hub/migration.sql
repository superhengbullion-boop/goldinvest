ALTER TABLE `Member`
  ADD COLUMN `tradingLimitMyr` DECIMAL(16, 2) NOT NULL DEFAULT 0,
  ADD COLUMN `address` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `companyName` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `registrationNo` VARCHAR(191) NOT NULL DEFAULT '',
  ADD COLUMN `locale` VARCHAR(16) NOT NULL DEFAULT 'en';

CREATE TABLE `BankAccount` (
  `id` VARCHAR(191) NOT NULL,
  `memberId` INTEGER NOT NULL,
  `holderName` VARCHAR(191) NOT NULL,
  `bankName` VARCHAR(191) NOT NULL,
  `accountNo` VARCHAR(191) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `BankAccount_memberId_status_idx`(`memberId`, `status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `BankAccount`
  ADD CONSTRAINT `BankAccount_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `Withdrawal` (
  `id` VARCHAR(191) NOT NULL,
  `memberId` INTEGER NOT NULL,
  `kind` VARCHAR(16) NOT NULL,
  `amount` DECIMAL(16, 6) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
  `bankAccountId` VARCHAR(191) NULL,
  `reviewedBy` VARCHAR(191) NULL,
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `Withdrawal_status_idx`(`status`),
  INDEX `Withdrawal_memberId_idx`(`memberId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `Withdrawal`
  ADD CONSTRAINT `Withdrawal_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `GoldTransfer` (
  `id` VARCHAR(191) NOT NULL,
  `fromMemberId` INTEGER NOT NULL,
  `toMemberId` INTEGER NOT NULL,
  `grams` DECIMAL(16, 6) NOT NULL,
  `status` VARCHAR(16) NOT NULL DEFAULT 'pending',
  `reviewedBy` VARCHAR(191) NULL,
  `reviewedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  INDEX `GoldTransfer_status_idx`(`status`),
  INDEX `GoldTransfer_fromMemberId_idx`(`fromMemberId`),
  INDEX `GoldTransfer_toMemberId_idx`(`toMemberId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `GoldTransfer`
  ADD CONSTRAINT `GoldTransfer_fromMemberId_fkey`
  FOREIGN KEY (`fromMemberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `GoldTransfer_toMemberId_fkey`
  FOREIGN KEY (`toMemberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE `Announcement` (
  `id` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
