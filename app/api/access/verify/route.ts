// app/api/access/verify/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/db/prisma";
import { decryptLink } from "@/lib/crypto/decrypt";
import { getDocsClient } from "@/lib/google/docs";


function extractGoogleDocId(url: string): string | null {
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match?.[1] ?? null;
}

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "missing token" }, { status: 400 });
    }


    const MASTER_KEY = process.env.MASTER_ENCRYPTION_KEY;

    if (!MASTER_KEY) {
      return NextResponse.json(
        { error: "missing MASTER_ENCRYPTION_KEY" },
        { status: 500 }
      );
    }

    const fingerprintSource = req.headers.get("user-agent") ?? "unknown";
    const fingerprintHash = crypto
      .createHash("sha256")
      .update(fingerprintSource)
      .digest("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    console.log("[ACCESS_VERIFY] start", {
      tokenHash: tokenHash.slice(0, 12) + "...",
      ua: (fingerprintSource || "").slice(0, 80),
    });

    const access = await prisma.accessToken.findUnique({
      where: { tokenHash },
      include: { link: true },
    });

    if (!access) {
      console.log("[ACCESS_VERIFY] invalid token");
      return NextResponse.json({ error: "invalid token" }, { status: 401 });
    }

    if (access.usedAt) {
      console.log("[ACCESS_VERIFY] token already used", { usedAt: access.usedAt });
      return NextResponse.json({ error: "token already used" }, { status: 401 });
    }

    if (access.expiresAt < new Date()) {
      console.log("[ACCESS_VERIFY] token expired", { expiresAt: access.expiresAt });
      return NextResponse.json({ error: "token expired" }, { status: 401 });
    }

    if (access.fingerprintHash !== fingerprintHash) {
      console.log("[ACCESS_VERIFY] invalid fingerprint", {
        expected: access.fingerprintHash.slice(0, 10) + "...",
        got: fingerprintHash.slice(0, 10) + "...",
      });
      return NextResponse.json({ error: "invalid fingerprint" }, { status: 401 });
    }

    if (access.link.status !== "active") {
      console.log("[ACCESS_VERIFY] link inactive", { linkStatus: access.link.status });
      return NextResponse.json({ error: "link inactive" }, { status: 403 });
    }

    const decryptedUrl = decryptLink(
      access.link.ciphertext,
      access.link.iv,
      access.link.tag,
      MASTER_KEY
    );

    console.log("[ACCESS_VERIFY] decrypted url", {
      linkId: access.linkId,
      urlPreview: typeof decryptedUrl === "string" ? decryptedUrl.slice(0, 80) : "??",
    });

    if (typeof decryptedUrl !== "string" || !decryptedUrl.includes("docs.google.com")) {
      return NextResponse.json({ error: "invalid decrypted content" }, { status: 400 });
    }

    const docId = extractGoogleDocId(decryptedUrl);
    if (!docId) {
      console.log("[ACCESS_VERIFY] invalid google doc url (missing docId)", {
        url: decryptedUrl.slice(0, 120),
      });
      return NextResponse.json({ error: "invalid google docs url" }, { status: 400 });
    }

    console.log("[ACCESS_VERIFY] fetching google doc", { docId });

    const docs = getDocsClient();

    let doc;
    try {
      doc = await docs.documents.get({ documentId: docId });
    } catch (err: any) {
      console.error("[ACCESS_VERIFY] google docs get failed", {
        docId,
        message: err?.message,
        code: err?.code,
        errors: err?.errors,
      });

      return NextResponse.json(
        {
          error:
            "google docs access denied (creator must share doc with service account as viewer)",
        },
        { status: 403 }
      );
    }

    const title = doc.data.title ?? "Untitled";
    const bodyLen = doc.data.body?.content?.length ?? 0;

    console.log("[ACCESS_VERIFY] google doc loaded", {
      title,
      bodyElements: bodyLen,
    });

    await prisma.accessToken.update({
      where: { id: access.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      doc: {
        id: docId,
        title,
        body: doc.data.body ?? null,
        meta: {
          linkId: access.linkId,
          expiresAt: access.expiresAt,
        },
      },
    });
  } catch (e: any) {
    console.error("[ACCESS_VERIFY] server error:", e?.message ?? e);
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
