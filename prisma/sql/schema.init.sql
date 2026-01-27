-- CreateTable
CREATE TABLE "PaymentLink" (
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

-- CreateTable
CREATE TABLE "AccessToken" (
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
CREATE UNIQUE INDEX "Payment_txSignature_key" ON "Payment"("txSignature");

-- CreateIndex
CREATE INDEX "Payment_linkId_idx" ON "Payment"("linkId");

-- CreateIndex
CREATE INDEX "Payment_payerWallet_idx" ON "Payment"("payerWallet");

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_tokenHash_key" ON "AccessToken"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_paymentId_key" ON "AccessToken"("paymentId");

-- CreateIndex
CREATE INDEX "AccessToken_linkId_idx" ON "AccessToken"("linkId");

-- CreateIndex
CREATE INDEX "AccessToken_expiresAt_idx" ON "AccessToken"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorTwitter_twitterId_key" ON "CreatorTwitter"("twitterId");

-- CreateIndex
CREATE INDEX "CreatorTwitter_wallet_idx" ON "CreatorTwitter"("wallet");

