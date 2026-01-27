import { NextResponse } from "next/server";
import { ShadowWireClient } from "@radr/shadowwire";

export async function POST(req: Request) {
  try {
    const { wallet, amountLamports } = await req.json();

    if (!wallet || typeof wallet !== "string") {
      return NextResponse.json(
        { error: "missing wallet" },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(amountLamports) ||
      amountLamports <= 0
    ) {
      return NextResponse.json(
        { error: "invalid amount" },
        { status: 400 }
      );
    }

    const client = new ShadowWireClient();

    const res = await client.withdraw({
      wallet,
      amount: amountLamports,
    });

    return NextResponse.json({
      unsignedTx: res.unsigned_tx_base64,
      amountWithdrawn: res.amount_withdrawn,
      fee: res.fee,
    });
  } catch (e: any) {
    console.error("withdraw error:", e);
    return NextResponse.json(
      { error: "withdraw failed" },
      { status: 500 }
    );
  }
}
