import { shadowwireClient } from "./client";

export async function createDepositTx(
  wallet: string,
  amountLamports: number
) {
  return shadowwireClient.deposit({
    wallet,
    amount: amountLamports,
  });
}
