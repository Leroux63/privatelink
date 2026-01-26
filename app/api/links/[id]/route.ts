import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "missing id" },
        { status: 400 }
      );
    }

    const link = await prisma.paymentLink.findUnique({
      where: { id },
      select: {
        id: true,
        amountLamports: true,
        status: true,
        creatorWallet: true,
        label: true,
      },
    });

    if (!link || link.status !== "active") {
      return NextResponse.json(
        { error: "link not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: link.id,
      label: link.label,
      amountLamports: link.amountLamports.toString(),
      status: link.status,
      creatorWallet: link.creatorWallet,
    });
  } catch (err) {
    console.error("GET /api/links/[id] error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
