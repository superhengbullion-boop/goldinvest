CREATE TABLE `PriceBar` (
  `pair` VARCHAR(16) NOT NULL,
  `minute` DATETIME(3) NOT NULL,
  `buyOpen` DECIMAL(16, 6) NOT NULL,
  `buyHigh` DECIMAL(16, 6) NOT NULL,
  `buyLow` DECIMAL(16, 6) NOT NULL,
  `buyClose` DECIMAL(16, 6) NOT NULL,
  `sellOpen` DECIMAL(16, 6) NOT NULL,
  `sellHigh` DECIMAL(16, 6) NOT NULL,
  `sellLow` DECIMAL(16, 6) NOT NULL,
  `sellClose` DECIMAL(16, 6) NOT NULL,
  `marketOpen` BOOLEAN NOT NULL DEFAULT true,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`pair`, `minute`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `PriceBar` (
  `pair`, `minute`,
  `buyOpen`, `buyHigh`, `buyLow`, `buyClose`,
  `sellOpen`, `sellHigh`, `sellLow`, `sellClose`,
  `marketOpen`, `updatedAt`
)
SELECT
  `pair`,
  FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(`recordedAt`) / 60) * 60),
  `buy`, `buy`, `buy`, `buy`,
  `sell`, `sell`, `sell`, `sell`,
  `marketOpen`,
  `recordedAt`
FROM `PriceSample`
ON DUPLICATE KEY UPDATE `updatedAt` = `PriceBar`.`updatedAt`;
