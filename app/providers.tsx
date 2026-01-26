"use client";

import { ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function Providers({ children }: { children: ReactNode }) {
  const endpoint = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_RPC_PROXY_URL;

    if (!url || !url.startsWith("http")) {
      throw new Error(
        "NEXT_PUBLIC_RPC_PROXY_URL is missing or invalid"
      );
    }

    return url;
  }, []);

  const wallets = useMemo(
    () => [new PhantomWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
