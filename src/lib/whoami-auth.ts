const SECRET_SALT = "whoami-vault-salt-portfolio-2026";

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getExpectedPasscode(): string {
  return process.env.VAULT_PASSCODE || "annas2026";
}

export async function createSessionToken(passcode: string): Promise<string> {
  return await sha256(`${passcode}:${SECRET_SALT}`);
}

export async function verifyPasscode(inputPasscode: string): Promise<boolean> {
  const expected = getExpectedPasscode();
  return inputPasscode.trim() === expected.trim();
}

export async function verifySessionToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string") {
    return false;
  }
  const expectedToken = await createSessionToken(getExpectedPasscode());
  return token === expectedToken;
}

export const WHOAMI_COOKIE_NAME = "whoami_vault_session";
