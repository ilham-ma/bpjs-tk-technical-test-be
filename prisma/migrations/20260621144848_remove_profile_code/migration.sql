/*
  Warnings:

  - You are about to drop the column `profileCode` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `users_profileCode_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `profileCode`;

-- CreateTable
CREATE TABLE `skills` (
    `id` VARCHAR(36) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `level` ENUM('Basic', 'Intermediate', 'Expert') NOT NULL,
    `userId` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `skills` ADD CONSTRAINT `skills_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
