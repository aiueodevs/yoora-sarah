import type { CatalogProductDetail } from '@yoora/database/catalog';
import type { StylistChatResponse } from './types';

function stripCodeFences(text: string): string {
  if (text.startsWith('```json')) {
    return text.replace(/^```json/, '').replace(/```$/, '').trim();
  }
  if (text.startsWith('```')) {
    return text.replace(/^```/, '').replace(/```$/, '').trim();
  }
  return text;
}

/**
 * Parse AI output JSON and map recommended slugs back to catalog products.
 */
export function parseStylistResponse(
  rawReply: string,
  products: CatalogProductDetail[],
): StylistChatResponse {
  const replyText = stripCodeFences(rawReply);

  let parsed: { content?: string; response?: string; recommended_slugs?: string[] };
  try {
    parsed = JSON.parse(replyText);
  } catch {
    let extractedContent = 'Maaf, sistem sedang memproses terlalu banyak data.';
    const contentMatch = replyText.match(/"content"\s*:\s*"([^"]*)/);
    if (contentMatch && contentMatch[1]) {
      extractedContent = contentMatch[1];
    }
    return { content: extractedContent, products: [] };
  }

  const recommendedProducts: StylistChatResponse['products'] = [];
  if (parsed.recommended_slugs && Array.isArray(parsed.recommended_slugs)) {
    for (const slug of parsed.recommended_slugs) {
      const product = products.find((p) => p.slug === slug);
      if (product) {
        recommendedProducts.push({
          name: product.name,
          category: product.categorySlug,
          price: product.price,
          image: product.colors?.[0]?.gallery?.[0] || product.image,
          slug: product.slug,
        });
      }
    }
  }

  return {
    content: parsed.content || parsed.response || 'Berikut rekomendasi kami:',
    products: recommendedProducts,
  };
}
