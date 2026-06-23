/*
  Warnings:

  - You are about to drop the column `userId` on the `skills` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `skills` DROP FOREIGN KEY `skills_userId_fkey`;

-- DropIndex
DROP INDEX `skills_userId_fkey` ON `skills`;

-- AlterTable
ALTER TABLE `educations` MODIFY `startDate` VARCHAR(8) NOT NULL,
    MODIFY `endDate` VARCHAR(8) NULL;

-- AlterTable
ALTER TABLE `employment_histories` MODIFY `startDate` VARCHAR(8) NOT NULL,
    MODIFY `endDate` VARCHAR(8) NULL;

-- AlterTable
ALTER TABLE `skills` DROP COLUMN `userId`;

-- AlterTable
ALTER TABLE `users` MODIFY `dateOfBirth` VARCHAR(11) NOT NULL;

-- CreateTable
CREATE TABLE `user_skills` (
    `userId` VARCHAR(36) NOT NULL,
    `skillId` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`userId`, `skillId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_skills` ADD CONSTRAINT `user_skills_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_skills` ADD CONSTRAINT `user_skills_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
