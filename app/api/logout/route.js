import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("isAdmin", "0", { path: "/", maxAge: 0 });
  return res;
}
