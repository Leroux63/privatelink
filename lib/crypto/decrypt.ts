import crypto from "crypto";

export function decryptLink(
  ciphertext: string,
  iv: string,
  tag: string,
  masterKeyBase64: string
) {
  const key = Buffer.from(masterKeyBase64, "base64");

  if (key.length !== 32) {
    throw new Error("invalid master key length");
  }

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(iv, "base64")
  );

  decipher.setAuthTag(Buffer.from(tag, "base64"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
