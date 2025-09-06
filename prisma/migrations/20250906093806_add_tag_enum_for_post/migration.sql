/*
  Warnings:

  - The `tags` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."Tag" AS ENUM ('UI', 'UX', 'WebDesign', 'MobileApp', 'Logo', 'Illustration', 'Typography', 'Dashboard', 'LandingPage', 'Animation', 'Branding', 'IconSet', 'Minimal', 'DarkMode', 'LightMode');

-- AlterTable
ALTER TABLE "public"."Post" DROP COLUMN "tags",
ADD COLUMN     "tags" "public"."Tag"[] DEFAULT ARRAY[]::"public"."Tag"[];
