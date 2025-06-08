/*
  Warnings:

  - Added the required column `userId` to the `PlanoAula` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PlanoAula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "atividades" TEXT NOT NULL,
    "avaliacao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    CONSTRAINT "PlanoAula_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PlanoAula" ("atividades", "avaliacao", "createdAt", "filePath", "id", "objetivos", "originalName") SELECT "atividades", "avaliacao", "createdAt", "filePath", "id", "objetivos", "originalName" FROM "PlanoAula";
DROP TABLE "PlanoAula";
ALTER TABLE "new_PlanoAula" RENAME TO "PlanoAula";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
