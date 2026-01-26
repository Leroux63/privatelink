import { google } from "googleapis";

function getCredentials() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

  if (!raw) {
    throw new Error("missing GOOGLE_SERVICE_ACCOUNT_BASE64");
  }

  return JSON.parse(
    Buffer.from(raw, "base64").toString("utf-8")
  );
}

export function getDocsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: [
      "https://www.googleapis.com/auth/documents.readonly",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  return google.docs({
    version: "v1",
    auth,
  });
}
