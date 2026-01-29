import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function supabaseServer() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

function isAdmin() {
  const cookieStore = cookies();
  return cookieStore.get("isAdmin")?.value === "1";
}

export async function GET() {
  try {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("skills_state")
      .select("data")
      .eq("id", "default")
      .single();

    if (error) throw error;

    return NextResponse.json(Array.isArray(data?.data) ? data.data : []);
  } catch (e) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    if (!isAdmin()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: "Expected an array" }, { status: 400 });
    }

    const supabase = supabaseServer();
    const { error } = await supabase.from("skills_state").upsert({
      id: "default",
      data: body,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
