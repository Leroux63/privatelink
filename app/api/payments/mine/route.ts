import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json({ error: "missing wallet" }, { status: 400 });
    }

    const payments = await prisma.payment.findMany({
      where: { payerWallet: wallet },
      orderBy: { createdAt: "desc" },
      include: {
        link: {
          select: {
            id: true,
            label: true,
            amountLamports: true,
            creatorWallet: true,
            status: true,
            createdAt: true,
          },
        },
        accessToken: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
            usedAt: true,
          },
        },
      },
    });

    const items = payments.map((p: any) => ({
      paymentId: p.id,
      createdAt: p.createdAt.toISOString(),
      status: p.status,
      txSignature: p.txSignature,
      amountLamports: p.amountLamports.toString(),
      token: p.token,

      link: p.link
        ? {
            id: p.link.id,
            label: p.link.label,
            amountLamports: p.link.amountLamports.toString(),
            creatorWallet: p.link.creatorWallet,
            status: p.link.status,
            createdAt: p.link.createdAt.toISOString(),
          }
        : null,

      access: p.accessToken
        ? {
            expiresAt: p.accessToken.expiresAt.toISOString(),
            usedAt: p.accessToken.usedAt
              ? p.accessToken.usedAt.toISOString()
              : null,
          }
        : null,
    }));

    return NextResponse.json({ payments: items });
  } catch (e) {
    console.error("POST /api/payments/mine error:", e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
