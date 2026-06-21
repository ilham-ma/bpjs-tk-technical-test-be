/*
  Warnings:

  - Added the required column `city` to the `educations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `educations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `educations` ADD COLUMN `city` VARCHAR(255) NOT NULL,
    ADD COLUMN `description` TEXT NOT NULL;
