-- CreateTable
CREATE TABLE `educations` (
    `id` VARCHAR(36) NOT NULL,
    `school` VARCHAR(255) NOT NULL,
    `degree` VARCHAR(255) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE,
    `userId` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `educations` ADD CONSTRAINT `educations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
