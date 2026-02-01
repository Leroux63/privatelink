import {
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Radio,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-16">
      <h2 className="text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
        {subtitle}
      </p>
      <div className="mt-6 grid gap-4">
        {children}
      </div>
    </section>
  );
}

function Card({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: any;
  title: string;
  description: string;
  status: "live" | "building" | "planned";
}) {
  const statusColor =
    status === "live"
      ? "text-[var(--color-success)]"
      : status === "building"
      ? "text-[var(--color-accent)]"
      : "text-[var(--color-text-muted)]";

  const statusLabel =
    status === "live"
      ? "Live"
      : status === "building"
      ? "In progress"
      : "Planned";

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-1 text-[var(--color-accent)]">
            <Icon size={20} />
          </div>
          <div>
            <h3 className="font-medium">
              {title}
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {description}
            </p>
          </div>
        </div>

        <span className={`text-xs font-medium ${statusColor}`}>
          {statusLabel}
        </span>
      </div>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      {/* Intro clarification */}
      <p className="mb-20 max-w-2xl text-[var(--color-text-muted)]">
        PrivateLink is live on Solana mainnet.
        <br />
        <br />
        PrivateLink is a product layer built on ShadowWire that turns
        private payments into private access.
        It protects both creators and users without ever hosting,
        copying or seeing the content.
      </p>

      <Section
        title="Current — Mainnet"
        subtitle="What is live today"
      >
        <Card
          icon={Lock}
          title="Private SOL payments"
          description="Private payments using Bulletproof zero-knowledge proofs via ShadowWire, with on-chain verifiability."
          status="live"
        />
        <Card
          icon={CheckCircle2}
          title="Non-custodial authentication"
          description="All actions require explicit wallet signatures. PrivateLink never holds keys or funds."
          status="live"
        />
        <Card
          icon={Layers}
          title="ShadowWire integration"
          description="Built on Radr Labs’ ShadowWire SDK for confidential balances and private payment pools."
          status="live"
        />
        <Card
          icon={FileText}
          title="Paid private access to Google Docs"
          description="Live today. Paid, private access to Google Docs documents without hosting, copying or indexing content."
          status="live"
        />
      </Section>

      <Section
        title="Next — Extending Access"
        subtitle="Expanding supported content providers"
      >
        <Card
          icon={FileText}
          title="Additional document providers"
          description="Extend paid private access to other document platforms (e.g. Notion)."
          status="building"
        />
        <Card
          icon={Sparkles}
          title="Multi-token private payments"
          description="Support for SPL tokens such as USDC, RADR, BONK and others already supported by ShadowWire."
          status="building"
        />
        <Card
          icon={Layers}
          title="Payment-aware UX"
          description="Clear fee breakdowns, minimum amounts and privacy modes surfaced directly in the interface."
          status="building"
        />
      </Section>

      <Section
        title="Evolution — Paid Private Access"
        subtitle="Beyond documents"
      >
        <Card
          icon={ImageIcon}
          title="Paid private access to media collections"
          description="Access-controlled photo and media collections with revocable, time-limited permissions."
          status="planned"
        />
        <Card
          icon={Radio}
          title="Paid private live access"
          description="Wallet-authenticated private live streams with anonymous viewers and unlinkable payments."
          status="planned"
        />
      </Section>

      <Section
        title="Long-term vision"
        subtitle="Composable privacy for creators and users"
      >
        <Card
          icon={Layers}
          title="PrivateLink as an access layer"
          description="A unified product layer that turns private payments into private access across content types."
          status="planned"
        />
      </Section>
    </main>
  );
}