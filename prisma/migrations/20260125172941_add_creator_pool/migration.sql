/*
  Warnings:

  - Added the required column `creatorPoolAddress` to the `PaymentLink` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "creatorWallet" TEXT NOT NULL,
    "creatorPoolAddress" TEXT NOT NULL,
    "amountLamports" BIGINT NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "label" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active'
);
INSERT INTO "new_PaymentLink" ("amountLamports", "ciphertext", "createdAt", "creatorWallet", "id", "iv", "label", "status", "tag") SELECT "amountLamports", "ciphertext", "createdAt", "creatorWallet", "id", "iv", "label", "status", "tag" FROM "PaymentLink";
DROP TABLE "PaymentLink";
ALTER TABLE "new_PaymentLink" RENAME TO "PaymentLink";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
