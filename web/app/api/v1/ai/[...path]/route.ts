import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.YOORA_INTERNAL_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

type RouteParams = {
  params: Promise<{ path: string[] }>;
};

async function handler(request: NextRequest, context: RouteParams) {
  const { path } = await context.params;
  
  // Remove 'ai' from path since we already in /ai/ folder
  const upstreamPath = path.join("/").replace(/^\/ai\//, "");
  const url = `${API_BASE}/ai/${upstreamPath}${request.nextUrl.search}`;

  const headers = new Headers(request.headers);
  const secret = process.env.YOORA_INTERNAL_API_SHARED_SECRET;
  if (secret) headers.set("x-yoora-internal-secret", secret);

  const body = request.method === "GET" || request.method === "HEAD" 
    ? undefined 
    : await request.text();

  try {
    const res = await fetch(url, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { "Content-Type": "application/json" } });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;