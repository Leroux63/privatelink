import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const upstream = process.env.HELIUS_API_URL;
  if (!upstream) {
    return NextResponse.json({ error: "missing HELIUS_API_URL" }, { status: 500 });
  }

  const body = await req.text();

  const res = await fetch(upstream, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { "content-type": "application/json" },
  });
}
