import type { StylistChatHistoryMessage } from './types';

/**
 * Call Groq LLM for text-only chat.
 */
export async function callGroq(
  apiKey: string,
  systemPrompt: string,
  message: string,
  history?: StylistChatHistoryMessage[],
): Promise<string> {
  const messages: Array<{ role: string; content: string }> = [
    { role: 'system', content: systemPrompt },
  ];

  if (history && Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        messages.push({ role: msg.role, content: msg.content });
      }
    }
  }

  messages.push({
    role: 'user',
    content: message || 'Tolong berikan rekomendasi outfit terbaik Anda.',
  });

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.6,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Call Gemini API for vision (image + text) chat.
 */
export async function callGemini(
  apiKey: string,
  systemPrompt: string,
  message: string,
  imageData: string,
  history?: StylistChatHistoryMessage[],
): Promise<string> {
  let mimeType = 'image/jpeg';
  let base64Data = imageData;

  if (imageData.startsWith('data:')) {
    const parts = imageData.split(',');
    mimeType = parts[0].split(':')[1].split(';')[0];
    base64Data = parts[1];
  }

  const geminiMessages: Array<{ role: string; parts: Array<Record<string, unknown>> }> = [];

  if (history && Array.isArray(history)) {
    for (const msg of history) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        geminiMessages.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
  }

  geminiMessages.push({
    role: 'user',
    parts: [
      { text: message || 'Tolong cocokkan baju/outfit dari katalog yang sesuai dengan foto ini.' },
      { inline_data: { mime_type: mimeType, data: base64Data } },
    ],
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiMessages,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    },
  );

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}
