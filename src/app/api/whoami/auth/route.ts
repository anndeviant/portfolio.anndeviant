import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  createSessionToken,
  getExpectedPasscode,
  verifyPasscode,
  verifySessionToken,
  WHOAMI_COOKIE_NAME,
} from "../../../../lib/whoami-auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { passcode } = body as { passcode?: string };

    if (!passcode || typeof passcode !== "string") {
      return NextResponse.json(
        { success: false, error: "Passcode is required." },
        { status: 400 },
      );
    }

    const isValid = await verifyPasscode(passcode);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Incorrect passcode." },
        { status: 401 },
      );
    }

    const token = await createSessionToken(getExpectedPasscode());
    const cookieStore = await cookies();

    cookieStore.set({
      name: WHOAMI_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Authentication error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(WHOAMI_COOKIE_NAME);
    const isAuthenticated = await verifySessionToken(sessionCookie?.value);

    return NextResponse.json({ authenticated: isAuthenticated });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
