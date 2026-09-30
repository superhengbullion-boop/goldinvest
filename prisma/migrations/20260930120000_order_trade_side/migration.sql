-- Add trade side (buy/sell) and rename lockedSellPrice → lockedPrice

ALTER TABLE `CartItem`
  ADD COLUMN `side` VARCHAR(191) NOT NULL DEFAULT 'buy' AFTER `unitKey`;

ALTER TABLE `CartItem`
  CHANGE COLUMN `lockedSellPrice` `lockedPrice` DECIMAL(16, 6) NOT NULL;

ALTER TABLE `CartItem`
  DROP FOREIGN KEY `CartItem_memberId_fkey`;

ALTER TABLE `CartItem`
  DROP INDEX `CartItem_memberId_metal_unitKey_key`;

ALTER TABLE `CartItem`
  ADD UNIQUE INDEX `CartItem_memberId_metal_unitKey_side_key`(`memberId`, `metal`, `unitKey`, `side`);

ALTER TABLE `CartItem`
  ADD CONSTRAINT `CartItem_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `OrderItem`
  ADD COLUMN `side` VARCHAR(191) NOT NULL DEFAULT 'buy' AFTER `unitKey`;

ALTER TABLE `OrderItem`
  CHANGE COLUMN `lockedSellPrice` `lockedPrice` DECIMAL(16, 6) NOT NULL;
