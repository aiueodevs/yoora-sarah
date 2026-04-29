import { NextRequest, NextResponse } from 'next/server';
import { getStorefrontCatalog } from '@/lib/storefront-catalog';
import {
  buildSystemPrompt,
  callGroq,
  callGemini,
  parseStylistResponse,
} from '@/lib/ai-stylist';
import type { StylistChatRequest } from '@/lib/ai-stylist';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY || !GEMINI_API_KEY) {
      return NextResponse.json(
        { content: 'Sistem belum dikonfigurasi sepenuhnya (API Key Groq/Gemini hilang).' },
        { status: 500 },
      );
    }

    const body: StylistChatRequest = await req.json();
    const { message, history, image } = body;

    const catalog = await getStorefrontCatalog();
    const systemPrompt = buildSystemPrompt(catalog.products);

    const replyText = image
      ? await callGemini(GEMINI_API_KEY, systemPrompt, message || '', image, history)
      : await callGroq(GROQ_API_KEY, systemPrompt, message || '', history);

    const result = parseStylistResponse(replyText, catalog.products);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Backend AI Error:', error);
    return NextResponse.json(
      { content: 'Terjadi kesalahan internal pada sistem Stylist.' },
      { status: 500 },
    );
  }
}
