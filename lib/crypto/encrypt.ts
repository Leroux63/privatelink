import crypto from "crypto";

export function encryptLink(
  plaintextUrl: string,
  masterKeyBase64: string
) {
  const key = Buffer.from(masterKeyBase64, "base64");

  if (key.length !== 32) {
    throw new Error("invalid master key length");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintextUrl, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
  };
}
