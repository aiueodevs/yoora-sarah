import { NextRequest, NextResponse } from "next/server";

const API_BASE =
  process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api/v1";

export async function POST(request: NextRequest) {
  const url = `${API_BASE}/ai/stylist/product-to-model`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const secret = process.env.YOORA_INTERNAL_API_SHARED_SECRET;
  if (secret) headers.set("x-yoora-internal-secret", secret);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: await request.text(),
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") ?? "application/json; charset=utf-8" },
    });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}
