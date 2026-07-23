-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Series" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "tmdbId" INTEGER NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "posterPath" TEXT,
    "year" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "currentSeason" INTEGER NOT NULL DEFAULT 0,
    "currentEpisode" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Series_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Series" ("createdAt", "currentEpisode", "currentSeason", "id", "rating", "status", "tmdbId", "updatedAt", "userId") SELECT "createdAt", "currentEpisode", "currentSeason", "id", "rating", "status", "tmdbId", "updatedAt", "userId" FROM "Series";
DROP TABLE "Series";
ALTER TABLE "new_Series" RENAME TO "Series";
CREATE UNIQUE INDEX "Series_userId_tmdbId_key" ON "Series"("userId", "tmdbId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
