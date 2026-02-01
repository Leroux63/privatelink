# PrivateLink — Privacy Hack 2026

**Track:** Private Payments  
**Sponsors:** Radr Labs (ShadowWire), Solana, Helius  
**Category:** Privacy-preserving creator monetization

---

## Problem

Today, creators who sell private content have only two bad options:

1. Host the content themselves → leaks, scraping, surveillance  
2. Use centralized platforms → censorship, loss of ownership  

Payments may be on-chain, but **access is never private**.

---

## Solution

**PrivateLink** separates **payment**, **access**, and **content**.

- Payments are **private** (ShadowWire pools)
- Access is **verified, time-limited, and unlinkable**
- Content is **never hosted, never copied, never indexed**

PrivateLink does **not** know what the content is.  
It only knows **whether access is allowed**.

> **Today, PrivateLink supports paid private access to Google Docs documents.**  
> The system is designed to be extensible to other content providers.

---

## Privacy model (core of the project)

### What is private?

| Layer | Privacy property |
|------|------------------|
| Payment | Amounts are hidden using ShadowWire |
| Access | Token-based, encrypted, time-limited |
| Content | Never stored, never proxied |
| Identity | Optional, creator-controlled |

### What PrivateLink CANNOT see

- Content body (Google Docs, links, files)
- User browsing behavior
- Wallet-to-content mapping after expiration

This protects **both creators and users** by design.

---

## Tech stack

- Solana + Wallet Adapter
- **ShadowWire (Radr Labs)** — private payment pools & confidential balances
- **Helius RPC** — reliable, privacy-respecting on-chain reads
- Next.js 16 / React 19
- Prisma + libSQL (Turso)
- **Google Docs API** — live today (read-only access verification)
- X OAuth (optional identity)

---

## How to run locally

```bash
npm install
npm run dev