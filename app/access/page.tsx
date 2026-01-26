"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header";

type GoogleTextRun = {
  content?: string;
};

type GoogleParagraphElement = {
  textRun?: GoogleTextRun;
};

type GoogleParagraph = {
  elements?: GoogleParagraphElement[];
};

type GoogleStructuralElement = {
  paragraph?: GoogleParagraph;
};

type GoogleDoc = {
  id: string;
  title: string;
  body: {
    content: GoogleStructuralElement[];
  };
};

export default function AccessPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [doc, setDoc] = useState<GoogleDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setError("missing access token");
      setLoading(false);
      return;
    }

    fetch("/api/access/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error ?? "access denied");
        return data;
      })
      .then((data) => {
        console.log("[ACCESS_PAGE] received doc", data.doc);
        setDoc(data.doc);
      })
      .catch((e) => {
        console.error("[ACCESS_PAGE] error", e);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function renderParagraph(p: GoogleParagraph) {
    if (!p.elements) return null;

    return p.elements.map((el, i) => {
      if (!el.textRun?.content) return null;
      return (
        <span key={i}>
          {el.textRun.content}
        </span>
      );
    });
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header />

      <main className="mx-auto max-w-3xl px-6 py-10 space-y-6">
        {loading && (
          <p className="text-sm opacity-60">
            unlocking content…
          </p>
        )}

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {doc && (
          <>
            <h1 className="text-2xl font-semibold">
              {doc.title}
            </h1>

            <div className="space-y-4 text-[15px] leading-relaxed">
              {doc.body.content.map((el, i) => {
                if (!el.paragraph) return null;

                return (
                  <p key={i}>
                    {renderParagraph(el.paragraph)}
                  </p>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
