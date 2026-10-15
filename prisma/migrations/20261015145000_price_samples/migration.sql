CREATE TABLE `PriceSample` (
  `id` VARCHAR(191) NOT NULL,
  `pair` VARCHAR(16) NOT NULL,
  `buy` DECIMAL(16, 6) NOT NULL,
  `sell` DECIMAL(16, 6) NOT NULL,
  `marketOpen` BOOLEAN NOT NULL DEFAULT true,
  `recordedAt` DATETIME(3) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `PriceSample_pair_recordedAt_idx`(`pair`, `recordedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
