-- CreateTable
CREATE TABLE `MetalQuote` (
    `id` VARCHAR(191) NOT NULL,
    `metal` VARCHAR(191) NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `price` DECIMAL(16, 6) NOT NULL,
    `bid` DECIMAL(16, 6) NULL,
    `ask` DECIMAL(16, 6) NULL,
    `unit` VARCHAR(191) NOT NULL DEFAULT 'troy_ounce',
    `priceGram` DECIMAL(16, 6) NULL,
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
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MetalQuote_metal_currency_key`(`metal`, `currency`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateRefreshTime` (
    `id` VARCHAR(191) NOT NULL,
    `time` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RateRefreshTime_time_key`(`time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateFetchLog` (
    `slotKey` VARCHAR(191) NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `ok` BOOLEAN NOT NULL DEFAULT true,
    `error` TEXT NULL,

    PRIMARY KEY (`slotKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
