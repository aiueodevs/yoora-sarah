import { NextRequest, NextResponse } from 'next/server';
import { getStorefrontCatalog } from '@/lib/storefront-catalog';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY || !GEMINI_API_KEY) {
      return NextResponse.json(
        { content: 'Sistem belum dikonfigurasi sepenuhnya (API Key Groq/Gemini hilang).' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { message, history, image } = body;

    // Load catalog
    const catalog = await getStorefrontCatalog();
    
    // Create catalog text for prompt
    const productsData = catalog.products.map(p => {
      const colors = p.colors?.map(c => c.name).join(', ') || '';
      const descriptionText = typeof p.description === 'string' ? p.description : '';
      return `- ${p.name} (Slug: ${p.slug}) | Kategori: ${p.categorySlug} | Harga: Rp${p.price.toLocaleString('id-ID')} | Warna: ${colors} | Style: ${descriptionText.substring(0, 80).replace(/\n/g, ' ')}...`;
    }).join('\n');

    const systemPrompt = `Anda adalah AI Fashion Stylist eksklusif dari "Yoora Sarah", sebuah brand modest fashion & hijab premium.
Tugas Anda adalah merangkai mix & match outfit dari katalog kami untuk membantu pelanggan.

Berikut adalah daftar produk yang tersedia di katalog Yoora Sarah:
${productsData}

ATURAN PENTING:
1. Pahami acara, gaya, atau request pelanggan.
2. Jika pelanggan mengunggah gambar (misalnya foto diri setengah/full badan, warna kulit, tas, atau sepatu), Anda harus menganalisa gaya (style), paduan warna, dan proporsi tubuh/barang tersebut. Cocokkan dengan produk katalog untuk menonjolkan kecantikan dan keanggunan pengguna.
3. Berikan balasan yang sangat sopan, elegan, dan profesional. Gunakan bahasa yang "luxury".
4. Anda HANYA BOLEH menghasilkan output berupa kode JSON (tanpa ada teks apapun di luar JSON).
5. Format JSON WAJIB sama persis seperti di bawah ini:

{
  "content": "Pesan ramah dan elegan Anda yang menjelaskan gaya dan rekomendasi pakaian...",
  "recommended_slugs": ["slug-produk-1", "slug-produk-2"]
}`;

    let replyText = "";

    // ----------------------------------------------------
    // HYBRID ROUTING: Use Gemini for Images, Groq for Text
    // ----------------------------------------------------
    if (image) {
      // USE GEMINI API FOR VISION
      let mimeType = "image/jpeg";
      let base64Data = image;
      if (image.startsWith("data:")) {
        const parts = image.split(",");
        mimeType = parts[0].split(":")[1].split(";")[0];
        base64Data = parts[1];
      }

      const geminiMessages = [];
      if (history && Array.isArray(history)) {
        for (const msg of history) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            geminiMessages.push({
              role: msg.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: msg.content }]
            });
          }
        }
      }

      geminiMessages.push({
        role: "user",
        parts: [
          { text: message || "Tolong cocokkan baju/outfit dari katalog yang sesuai dengan foto ini." },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      });

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        })
      });

      if (!geminiResponse.ok) {
        console.error("Gemini API Error:", await geminiResponse.text());
        return NextResponse.json({ content: "Mohon maaf, sistem vision kami sedang sibuk." }, { status: 500 });
      }

      const data = await geminiResponse.json();
      replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    } else {
      // USE GROQ API FOR TEXT-ONLY (SPEED)
      const messages = [
        { role: "system", content: systemPrompt },
      ];

      if (history && Array.isArray(history)) {
        for (const msg of history) {
          if (msg.role === 'user' || msg.role === 'assistant') {
            messages.push({ role: msg.role, content: msg.content });
          }
        }
      }

      messages.push({ role: "user", content: message || "Tolong berikan rekomendasi outfit terbaik Anda." });

      const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages,
          temperature: 0.6,
          max_tokens: 1500,
          response_format: { type: "json_object" }
        })
      });

      if (!groqResponse.ok) {
        console.error("Groq API Error:", await groqResponse.text());
        return NextResponse.json({ content: "Mohon maaf, asisten AI sedang sibuk." }, { status: 500 });
      }

      const data = await groqResponse.json();
      replyText = data.choices[0].message.content.trim();
    }

    // ----------------------------------------------------
    // PROCESS OUTPUT & MATCH CATALOG
    // ----------------------------------------------------
    if (replyText.startsWith('```json')) {
      replyText = replyText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (replyText.startsWith('```')) {
      replyText = replyText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(replyText);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", replyText);
      // Fallback regex extraction if JSON is cut off mid-sentence
      let extractedContent = "Maaf, sistem sedang memproses terlalu banyak data.";
      const contentMatch = replyText.match(/"content"\s*:\s*"([^"]*)/);
      if (contentMatch && contentMatch[1]) {
        extractedContent = contentMatch[1];
      }
      return NextResponse.json({ content: extractedContent, products: [] });
    }

    const recommendedProducts = [];
    if (parsed.recommended_slugs && Array.isArray(parsed.recommended_slugs)) {
      for (const slug of parsed.recommended_slugs) {
        const product = catalog.products.find(p => p.slug === slug);
        if (product) {
          recommendedProducts.push({
            name: product.name,
            category: product.categorySlug,
            price: product.price,
            image: product.colors?.[0]?.gallery?.[0] || product.image,
            slug: product.slug
          });
        }
      }
    }

    return NextResponse.json({
      content: parsed.content || parsed.response || "Berikut rekomendasi kami:",
      products: recommendedProducts
    });

  } catch (error) {
    console.error("Backend AI Error:", error);
    return NextResponse.json({ content: "Terjadi kesalahan internal pada sistem Stylist." }, { status: 500 });
  }
}
