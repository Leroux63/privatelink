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
      {/* Intro text (PAS un header) */}
      <p className="mb-20 max-w-2xl text-[var(--color-text-muted)]">
        PrivateLink is live on Solana mainnet.
        This roadmap describes how we progressively expand privacy
        primitives — from private payments to private content and access.
      </p>

      <Section
        title="Current — Mainnet"
        subtitle="What is live today"
      >
        <Card
          icon={Lock}
          title="Private SOL transfers"
          description="Private payments using Bulletproof zero-knowledge proofs with on-chain verifiability."
          status="live"
        />
        <Card
          icon={CheckCircle2}
          title="Non-custodial wallet authentication"
          description="All actions require explicit wallet signatures. No custody."
          status="live"
        />
        <Card
          icon={Layers}
          title="ShadowWire protocol integration"
          description="Built on Radr Labs’ ShadowWire SDK with client-side proof generation."
          status="live"
        />
      </Section>

      <Section
        title="Next — Privacy as a Primitive"
        subtitle="Exposing existing protocol capabilities"
      >
        <Card
          icon={Sparkles}
          title="Multi-token private payments"
          description="USDC, RADR, BONK and other SPL tokens already supported by the protocol."
          status="building"
        />
        <Card
          icon={Layers}
          title="Token-aware UX"
          description="Fee breakdowns, minimums and privacy mode selection in UI."
          status="building"
        />
      </Section>

      <Section
        title="Evolution — Private Content"
        subtitle="Beyond payments"
      >
        <Card
          icon={FileText}
          title="Private documents"
          description="Notion-like private documents gated by wallet or private links."
          status="planned"
        />
        <Card
          icon={ImageIcon}
          title="Private media collections"
          description="Encrypted photo & media collections with revocable access."
          status="planned"
        />
        <Card
          icon={Radio}
          title="Private streaming"
          description="Wallet-authenticated private live streams with anonymous viewers."
          status="planned"
        />
      </Section>

      <Section
        title="Long-term vision"
        subtitle="Composable privacy layer"
      >
        <Card
          icon={Layers}
          title="PrivateLink as a privacy layer"
          description="Unified interface for private payments, content and access control on Solana."
          status="planned"
        />
      </Section>
    </main>
  );
}