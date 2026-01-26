/*
  Warnings:

  - You are about to drop the column `amountSol` on the `PaymentLink` table. All the data in the column will be lost.
  - You are about to drop the column `recipientWallet` on the `PaymentLink` table. All the data in the column will be lost.
  - Made the column `payerWallet` on table `AccessToken` required. This step will fail if there are existing NULL values in that column.
  - Made the column `txSignature` on table `AccessToken` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amountLamports` to the `PaymentLink` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creatorWallet` to the `PaymentLink` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "tokenHash" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "txSignature" TEXT NOT NULL,
    "payerWallet" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    CONSTRAINT "AccessToken_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "PaymentLink" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccessToken" ("createdAt", "expiresAt", "fingerprintHash", "id", "linkId", "payerWallet", "tokenHash", "txSignature", "usedAt") SELECT "createdAt", "expiresAt", "fingerprintHash", "id", "linkId", "payerWallet", "tokenHash", "txSignature", "usedAt" FROM "AccessToken";
DROP TABLE "AccessToken";
ALTER TABLE "new_AccessToken" RENAME TO "AccessToken";
CREATE UNIQUE INDEX "AccessToken_tokenHash_key" ON "AccessToken"("tokenHash");
CREATE INDEX "AccessToken_linkId_idx" ON "AccessToken"("linkId");
CREATE INDEX "AccessToken_expiresAt_idx" ON "AccessToken"("expiresAt");
CREATE TABLE "new_PaymentLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorWallet" TEXT NOT NULL,
    "amountLamports" BIGINT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active'
);
INSERT INTO "new_PaymentLink" ("ciphertext", "createdAt", "id", "iv", "label", "tag") SELECT "ciphertext", "createdAt", "id", "iv", "label", "tag" FROM "PaymentLink";
DROP TABLE "PaymentLink";
ALTER TABLE "new_PaymentLink" RENAME TO "PaymentLink";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
