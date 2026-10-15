import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { WHOAMI_COOKIE_NAME } from "../../../../lib/whoami-auth";

export const runtime = "edge";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(WHOAMI_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Logout error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
