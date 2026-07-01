import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (username === "admin" && password === "adminweaweb") {
      // Set secure cookie
      const cookieStore = await cookies();
      cookieStore.set({
        name: 'weaweb_admin_session',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
