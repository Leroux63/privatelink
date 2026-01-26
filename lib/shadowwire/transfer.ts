import { shadowwireClient } from "./client";
import type { WalletAdapter } from "@radr/shadowwire";

export async function privateTransfer(params: {
  sender: string;
  recipient: string;
  amount: number;
  wallet: WalletAdapter;
}) {
  return shadowwireClient.transfer({
    sender: params.sender,
    recipient: params.recipient,
    amount: params.amount,
    token: "SOL",
    type: "internal",
    wallet: params.wallet,
  });
}
