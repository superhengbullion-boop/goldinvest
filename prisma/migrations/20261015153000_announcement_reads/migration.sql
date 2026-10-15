CREATE TABLE `AnnouncementRead` (
  `memberId` INTEGER NOT NULL,
  `announcementId` VARCHAR(191) NOT NULL,
  `readAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `AnnouncementRead_announcementId_idx`(`announcementId`),
  PRIMARY KEY (`memberId`, `announcementId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AnnouncementRead`
  ADD CONSTRAINT `AnnouncementRead_memberId_fkey`
  FOREIGN KEY (`memberId`) REFERENCES `Member`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `AnnouncementRead`
  ADD CONSTRAINT `AnnouncementRead_announcementId_fkey`
  FOREIGN KEY (`announcementId`) REFERENCES `Announcement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Withdrawals submitted before the hold now reduce the balance once.
UPDATE `Member` m
JOIN (
  SELECT `memberId`,
         SUM(CASE WHEN `kind` = 'xau' THEN `amount` ELSE 0 END) AS xauHold,
         SUM(CASE WHEN `kind` = 'fund' THEN `amount` ELSE 0 END) AS fundHold
  FROM `Withdrawal`
  WHERE `status` = 'pending'
  GROUP BY `memberId`
) w ON w.`memberId` = m.`id`
SET m.`xauGrams` = m.`xauGrams` - w.xauHold,
    m.`fundMyr` = m.`fundMyr` - w.fundHold,
    m.`updatedAt` = CURRENT_TIMESTAMP(3);

UPDATE `Page`
SET `content` = CAST(REPLACE(CAST(`content` AS CHAR), 'Eliz', 'SuperHeng') AS JSON),
    `updatedAt` = CURRENT_TIMESTAMP(3)
WHERE `slug` = 'deposit-settings'
  AND CAST(`content` AS CHAR) LIKE '%Eliz%';
