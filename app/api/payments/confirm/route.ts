import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const {
      linkId,
      txSignature,
      payerWallet,
      amountLamports,
    } = await req.json();

    if (!linkId || !txSignature || !payerWallet || !amountLamports) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400 }
      );
    }

    let finalTxSignature = txSignature;

    if (txSignature.includes("TX2:")) {
      const match = txSignature.match(/TX2:([A-Za-z0-9]+)/);
      if (!match) {
        return NextResponse.json(
          { error: "invalid tx signature format" },
          { status: 400 }
        );
      }
      finalTxSignature = match[1];
    }

    const link = await prisma.paymentLink.findUnique({
      where: { id: linkId },
    });

    if (!link || link.status !== "active") {
      return NextResponse.json(
        { error: "invalid link" },
        { status: 404 }
      );
    }

    if (BigInt(amountLamports) !== link.amountLamports) {
      return NextResponse.json(
        { error: "invalid amount" },
        { status: 400 }
      );
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { txSignature: finalTxSignature },
      include: { accessToken: true },
    });

    if (existingPayment?.accessToken) {
      return NextResponse.json({
        success: true,
        alreadyConfirmed: true,
        expiresAt: existingPayment.accessToken.expiresAt,
      });
    }

    const heliusUrl = process.env.HELIUS_API_URL;
    if (!heliusUrl) {
      return NextResponse.json(
        { error: "missing HELIUS_API_URL" },
        { status: 500 }
      );
    }

    const rpcRes = await fetch(heliusUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignatureStatuses",
        params: [[finalTxSignature], { searchTransactionHistory: true }],
      }),
    });

    const rpcJson = await rpcRes.json();
    const status = rpcJson?.result?.value?.[0];

    if (!status || status.confirmationStatus !== "finalized") {
      return NextResponse.json(
        { error: "transaction not finalized yet" },
        { status: 409 }
      );
    }

    /**
     * 6️⃣ Créer Payment (MAINTENANT SEULEMENT)
     */
    const payment =
      existingPayment ??
      (await prisma.payment.create({
        data: {
          id: crypto.randomUUID(),
          linkId,
          payerWallet,
          amountLamports,
          token: "SOL",
          txSignature: finalTxSignature,
          status: "confirmed",
        },
      }));

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const fingerprintHash = crypto
      .createHash("sha256")
      .update(req.headers.get("user-agent") ?? "unknown")
      .digest("hex");

    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await prisma.accessToken.create({
      data: {
        id: crypto.randomUUID(),
        tokenHash,
        fingerprintHash,
        expiresAt,
        paymentId: payment.id,
        linkId,
      },
    });

    return NextResponse.json({
      success: true,
      accessToken: rawToken,
      expiresAt,
    });
  } catch (e) {
    console.error("payment confirm error:", e);
    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    );
  }
}
