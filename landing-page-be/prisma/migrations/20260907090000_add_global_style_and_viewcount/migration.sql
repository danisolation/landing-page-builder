-- AlterTable: editor global styles (StylePanel) + public view counter
ALTER TABLE "Page" ADD COLUMN "globalStyle" JSONB;
ALTER TABLE "Page" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
