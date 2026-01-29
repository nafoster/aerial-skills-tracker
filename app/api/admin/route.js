import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request) {
  // Read cookie from the request (reliable)
  const isAdmin = request.cookies.get("isAdmin")?.value === "1";
  return NextResponse.json({ isAdmin });
}
