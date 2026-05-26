-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('videogame', 'tabletop', 'app', 'novel', 'worldbuilding');

-- AlterTable
ALTER TABLE "Game" ADD COLUMN "projectType" "ProjectType" NOT NULL DEFAULT 'videogame';
