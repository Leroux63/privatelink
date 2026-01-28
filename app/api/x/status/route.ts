import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const wallet: string | undefined = body?.wallet;

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  const features = await prisma.creatorFeatures.findUnique({
    where: { wallet },
  });

  const profile = await prisma.creatorTwitter.findUnique({
    where: { wallet },
  });

  return NextResponse.json({
    enabled: !!features?.twitterEnabled,
    connected: !!profile,
    profile,
  });
}
