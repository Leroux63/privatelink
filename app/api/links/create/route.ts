import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/db/prisma";
import { encryptLink } from "@/lib/crypto/encrypt";

const MASTER_KEY_ENV = process.env.MASTER_ENCRYPTION_KEY;

if (!MASTER_KEY_ENV) {
  throw new Error("missing MASTER_ENCRYPTION_KEY");
}

const MASTER_KEY: string = MASTER_KEY_ENV;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      priceSol,
      docUrl,
      creatorWallet,
      creatorPoolAddress,
      label,
    } = body;

    if (
      !priceSol ||
      !docUrl ||
      !creatorWallet ||
      !creatorPoolAddress
    ) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400 }
      );
    }

    if (!label || !label.trim()) {
      return NextResponse.json(
        { error: "label is required" },
        { status: 400 }
      );
    }

    if (!docUrl.includes("docs.google.com")) {
      return NextResponse.json(
        { error: "invalid google docs url" },
        { status: 400 }
      );
    }

    const amountLamports = BigInt(
      Math.floor(Number(priceSol) * 1e9)
    );

    if (amountLamports <= 0n) {
      return NextResponse.json(
        { error: "invalid amount" },
        { status: 400 }
      );
    }

    const encrypted = encryptLink(docUrl, MASTER_KEY);

    const linkId = crypto.randomUUID();

    await prisma.paymentLink.create({
      data: {
        id: linkId,
        creatorWallet,
        creatorPoolAddress,
        amountLamports,
        ciphertext: encrypted.ciphertext,
        iv: encrypted.iv,
        tag: encrypted.tag,
        label: label.trim(),
        status: "active",
      },
    });

    return NextResponse.json({ linkId });
  } catch (e) {
    console.error("create link error:", e);
    return NextResponse.json(
      { error: "internal error" },
      { status: 500 }
    );
  }
}
