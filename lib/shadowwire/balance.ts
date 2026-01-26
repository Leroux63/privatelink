import { shadowwireClient } from "./client";

export async function getShadowwireBalance(
  wallet: string,
  token: "SOL" = "SOL"
) {
  return shadowwireClient.getBalance(wallet, token);
}
