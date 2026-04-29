import { NextRequest, NextResponse } from "next/server";

const storefrontApiBaseUrl =
  process.env.YOORA_STOREFRONT_API_BASE_URL?.replace(/\/$/, "") ??
  process.env.YOORA_INTERNAL_API_BASE_URL?.replace(/\/$/, "");

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

async function forwardRequest(request: NextRequest, context: RouteContext) {
  if (!storefrontApiBaseUrl) {
    return NextResponse.json(
      { error: "Storefront API base URL is not configured." },
      { status: 500 },
    );
  }

  const { path } = await context.params;
  const upstreamPath = path.join("/");
  const upstreamUrl = `${storefrontApiBaseUrl}/${upstreamPath}${request.nextUrl.search}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  const sharedSecret = process.env.YOORA_INTERNAL_API_SHARED_SECRET;
  if (sharedSecret) {
    headers.set("x-yoora-internal-secret", sharedSecret);
  }

  const bodyText =
    request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text();

  const upstreamResponse = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body: bodyText ? bodyText : undefined,
    cache: "no-store",
  });
  const responseText = await upstreamResponse.text();

  return new NextResponse(responseText, {
    status: upstreamResponse.status,
    headers: {
      "Content-Type":
        upstreamResponse.headers.get("content-type") ?? "application/json; charset=utf-8",
    },
  });
}

export async function GET(request: NextRequest, context: RouteContext) {
  return forwardRequest(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return forwardRequest(request, context);
}
