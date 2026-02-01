"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";


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


function AccessInner() {
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
        setDoc(data.doc);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  function renderParagraph(p: GoogleParagraph) {
    if (!p.elements) return null;

    return p.elements.map((el, i) =>
      el.textRun?.content ? (
        <span key={i}>{el.textRun.content}</span>
      ) : null
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

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
              {doc.body.content.map((el, i) =>
                el.paragraph ? (
                  <p key={i}>
                    {renderParagraph(el.paragraph)}
                  </p>
                ) : null
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AccessPage() {
  return (
    <Suspense fallback={<p className="p-6">loading…</p>}>
      <AccessInner />
    </Suspense>
  );
}
