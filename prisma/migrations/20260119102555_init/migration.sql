-- CreateTable
CREATE TABLE "PaymentLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipientWallet" TEXT NOT NULL,
    "amountSol" REAL NOT NULL,
    "ciphertext" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "label" TEXT
);

-- CreateTable
CREATE TABLE "AccessToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "tokenHash" TEXT NOT NULL,
    "fingerprintHash" TEXT NOT NULL,
    "txSignature" TEXT,
    "payerWallet" TEXT,
    "linkId" TEXT NOT NULL,
    CONSTRAINT "AccessToken_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "PaymentLink" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_tokenHash_key" ON "AccessToken"("tokenHash");
