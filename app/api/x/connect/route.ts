import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

function base64url(buf: Buffer) {
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function POST(req: Request) {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing X_CLIENT_ID or X_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => null);
  const wallet: string | undefined = body?.wallet;

  if (!wallet) {
    return NextResponse.json(
      { error: "Missing wallet" },
      { status: 400 }
    );
  }

  const features = await prisma.creatorFeatures.findUnique({
    where: { wallet },
  });

  if (!features?.twitterEnabled) {
    return NextResponse.json(
      { error: "X feature locked" },
      { status: 402 }
    );
  }

  const state = crypto.randomUUID();
  const codeVerifier = base64url(crypto.randomBytes(32));
  const codeChallenge = base64url(
    crypto.createHash("sha256").update(codeVerifier).digest()
  );

  const authorizeUrl =
    "https://x.com/i/oauth2/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "users.read",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
    }).toString();

  const res = NextResponse.json({ redirectUrl: authorizeUrl });

  res.cookies.set("x_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  res.cookies.set("x_code_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  res.cookies.set("x_wallet", wallet, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });

  return res;
}
