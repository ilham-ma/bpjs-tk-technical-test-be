-- CreateTable
CREATE TABLE `employment_histories` (
    `id` VARCHAR(36) NOT NULL,
    `jobTitle` VARCHAR(255) NOT NULL,
    `employer` VARCHAR(255) NOT NULL,
    `startDate` DATE NOT NULL,
    `endDate` DATE,
    `city` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `userId` VARCHAR(36) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `employment_histories` ADD CONSTRAINT `employment_histories_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
