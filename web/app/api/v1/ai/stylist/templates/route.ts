import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";

export async function GET() {
  const url = `${API_BASE}/ai/stylist/templates`;

  const headers = new Headers();
  const secret = process.env.YOORA_INTERNAL_API_SHARED_SECRET;
  if (secret) headers.set("x-yoora-internal-secret", secret);

  try {
    const res = await fetch(url, { headers, cache: "no-store" });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
