import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { paymentId, wallet } = await req.json();

    if (!paymentId || !wallet) {
      return NextResponse.json(
        { error: "missing fields" },
        { status: 400 }
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { accessToken: true },
    });

    if (!payment || payment.status !== "confirmed") {
      return NextResponse.json(
        { error: "invalid payment" },
        { status: 404 }
      );
    }

    if (payment.payerWallet !== wallet) {
      return NextResponse.json(
        { error: "unauthorized" },
        { status: 403 }
      );
    }

    const access = payment.accessToken;
    if (!access) {
      return NextResponse.json(
        { error: "no access token" },
        { status: 404 }
      );
    }

    if (access.usedAt || access.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "access expired" },
        { status: 403 }
      );
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    await prisma.accessToken.update({
      where: { id: access.id },
      data: { tokenHash },
    });

    return NextResponse.json({
      success: true,
      token: rawToken,
    });
  } catch (e) {
    console.error("access redeem error:", e);
    return NextResponse.json(
      { error: "server error" },
      { status: 500 }
    );
  }
}
