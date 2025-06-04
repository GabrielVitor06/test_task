-- CreateTable
CREATE TABLE "PlanoAula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "objetivos" TEXT NOT NULL,
    "atividades" TEXT NOT NULL,
    "avaliacao" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
