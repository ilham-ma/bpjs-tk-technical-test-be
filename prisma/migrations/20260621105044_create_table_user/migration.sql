-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `profileCode` INTEGER NOT NULL,
    `wantedJobTitle` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(14) NOT NULL,
    `country` VARCHAR(30) NOT NULL,
    `city` VARCHAR(30) NOT NULL,
    `address` TEXT NOT NULL,
    `postalCode` VARCHAR(6) NOT NULL,
    `drivingLicense` VARCHAR(20) NOT NULL,
    `nationality` VARCHAR(30) NOT NULL,
    `placeOfBirth` VARCHAR(25) NOT NULL,
    `dateOfBirth` DATE NOT NULL,
    `photoUrl` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_profileCode_key`(`profileCode`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
