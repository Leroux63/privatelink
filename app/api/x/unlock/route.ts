import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const wallet: string | undefined = body?.wallet;

  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }

  await prisma.creatorFeatures.upsert({
    where: { wallet },
    update: { twitterEnabled: true },
    create: { wallet, twitterEnabled: true },
  });

  return NextResponse.json({ ok: true });
}
