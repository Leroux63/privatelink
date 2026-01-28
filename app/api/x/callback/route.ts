import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

function getCookie(req: Request, name: string) {
  const raw = req.headers.get("cookie") || "";
  const part = raw.split("; ").find((c) => c.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.split("=").slice(1).join("=")) : null;
}

export async function GET(req: Request) {
  const clientId = process.env.X_CLIENT_ID;
  const redirectUri = process.env.X_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing X_CLIENT_ID or X_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const returnedState = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
  if (!code || !returnedState) {
    return NextResponse.json({ error: "Missing code/state" }, { status: 400 });
  }

  const expectedState = getCookie(req, "x_oauth_state");
  const codeVerifier = getCookie(req, "x_code_verifier");
  const wallet = getCookie(req, "x_wallet");

  if (!expectedState || !codeVerifier || !wallet) {
    return NextResponse.json({ error: "Missing OAuth cookies" }, { status: 400 });
  }

  if (returnedState !== expectedState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const features = await prisma.creatorFeatures.findUnique({
    where: { wallet },
  });
  if (!features?.twitterEnabled) {
    return NextResponse.json({ error: "X feature locked" }, { status: 402 });
  }

  const tokenRes = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization":
        "Basic " +
        Buffer.from(
          `${clientId}:${process.env.X_CLIENT_SECRET}`
        ).toString("base64"),
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
      code_verifier: codeVerifier,
    }),
  });


  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok || !tokenJson.access_token) {
    return NextResponse.json(
      { error: "Token exchange failed", details: tokenJson },
      { status: 400 }
    );
  }

  const meRes = await fetch(
    "https://api.x.com/2/users/me?user.fields=profile_image_url,name,username",
    {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    }
  );

  const meJson = await meRes.json();
  if (!meRes.ok || !meJson?.data?.id) {
    return NextResponse.json(
      { error: "Failed to fetch user profile", details: meJson },
      { status: 400 }
    );
  }

  const data = meJson.data as {
    id: string;
    username: string;
    name: string;
    profile_image_url?: string;
  };

  await prisma.creatorTwitter.upsert({
    where: { wallet },
    update: {
      twitterId: data.id,
      twitterUsername: data.username,
      twitterName: data.name,
      twitterAvatarUrl: data.profile_image_url ?? "",
    },
    create: {
      wallet,
      twitterId: data.id,
      twitterUsername: data.username,
      twitterName: data.name,
      twitterAvatarUrl: data.profile_image_url ?? "",
    },
  });

  const res = NextResponse.redirect("/dashboard");
  res.cookies.set("x_oauth_state", "", { path: "/", maxAge: 0 });
  res.cookies.set("x_code_verifier", "", { path: "/", maxAge: 0 });
  res.cookies.set("x_wallet", "", { path: "/", maxAge: 0 });

  return res;
}
