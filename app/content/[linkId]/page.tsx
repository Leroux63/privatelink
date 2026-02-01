"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ContentPage() {
  const params = useParams<{ linkId: string }>();
  const linkId = params.linkId;

  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!linkId) return;

    const token = localStorage.getItem(`access_token_${linkId}`);
    if (!token) {
      setError("no access token found");
      return;
    }

    fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error || "access denied");
        setContent(json.content);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [linkId]);

  return (
    <>
      <main className="mx-auto max-w-2xl p-6">
        {error && <p className="text-red-500">{error}</p>}
        {!error && !content && <p>loading…</p>}
        {content && <pre className="whitespace-pre-wrap">{content}</pre>}
      </main>
    </>
  );
}
