-- CreateTable
CREATE TABLE "CreatorFeatures" (
    "wallet" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "twitterEnabled" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "CreatorTwitter" (
    "wallet" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twitterId" TEXT NOT NULL,
    "twitterUsername" TEXT NOT NULL,
    "twitterName" TEXT NOT NULL,
    "twitterAvatarUrl" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorTwitter_twitterId_key" ON "CreatorTwitter"("twitterId");

-- CreateIndex
CREATE INDEX "CreatorTwitter_wallet_idx" ON "CreatorTwitter"("wallet");
