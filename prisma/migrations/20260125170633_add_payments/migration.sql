/*
  Warnings:

  - You are about to drop the column `payerWallet` on the `AccessToken` table. All the data in the column will be lost.
  - You are about to drop the column `txSignature` on the `AccessToken` table. All the data in the column will be lost.
  - Added the required column `paymentId` to the `AccessToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "linkId" TEXT NOT NULL,
    "payerWallet" TEXT NOT NULL,
    "amountLamports" BIGINT NOT NULL,
    "token" TEXT NOT NULL DEFAULT 'SOL',
    "txSignature" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'confirmed',
    CONSTRAINT "Payment_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "PaymentLink" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "paymentId" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    CONSTRAINT "AccessToken_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AccessToken_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "PaymentLink" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_AccessToken" ("createdAt", "expiresAt", "fingerprintHash", "id", "linkId", "tokenHash", "usedAt") SELECT "createdAt", "expiresAt", "fingerprintHash", "id", "linkId", "tokenHash", "usedAt" FROM "AccessToken";
DROP TABLE "AccessToken";
ALTER TABLE "new_AccessToken" RENAME TO "AccessToken";
CREATE UNIQUE INDEX "AccessToken_tokenHash_key" ON "AccessToken"("tokenHash");
CREATE UNIQUE INDEX "AccessToken_paymentId_key" ON "AccessToken"("paymentId");
CREATE INDEX "AccessToken_linkId_idx" ON "AccessToken"("linkId");
CREATE INDEX "AccessToken_expiresAt_idx" ON "AccessToken"("expiresAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_txSignature_key" ON "Payment"("txSignature");

-- CreateIndex
CREATE INDEX "Payment_linkId_idx" ON "Payment"("linkId");

-- CreateIndex
CREATE INDEX "Payment_payerWallet_idx" ON "Payment"("payerWallet");
