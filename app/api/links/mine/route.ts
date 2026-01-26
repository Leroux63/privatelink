import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json(
        { error: "wallet required" },
        { status: 401 }
      );
    }

    const links = await prisma.paymentLink.findMany({
      where: { creatorWallet: wallet },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        amountLamports: true,
        status: true,
        label: true,
      },
    });

    const safeLinks = links.map((l: any) => ({
      id: l.id,
      createdAt: l.createdAt,
      amountLamports: l.amountLamports.toString(),
      status: l.status,
      label: l.label,
    }));

    return NextResponse.json({ links: safeLinks });
  } catch (err) {
    console.error("POST /api/links/mine error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
