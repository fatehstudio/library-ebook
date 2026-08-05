import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured on the server.' },
        { status: 500 }
      );
    }

    const { messages, highlights } = await req.json();

    // Compile dynamic notes context for RAG
    const notesContext = highlights && highlights.length > 0
      ? highlights.map((h: any, idx: number) => `Note #${idx + 1}: [Category: ${h.collection || 'General'}] [Source: ${h.bookTitle || h.source || 'Unknown'}] Highlight: "${h.text}" | Thought: "${h.note || ''}"`).join('\n')
      : 'No notes saved yet in the user library.';

    const systemPrompt = `You are the Antigravity Study Companion, a premium AI learning assistant for the user's Knowledge Library.
You are given the user's saved study highlights and thoughts below to help answer their questions.
Always refer to these notes when answering. If the user asks for summaries or synthesis, use the notes.
Keep answers structured, concise, and beautifully formatted in markdown.

[Saved Library Notes]:
${notesContext}

[Formatting Guidelines]:
1. If the user asks for a visual summary, infographic, chart, flow, mind map, or diagram, generate a beautiful, responsive, raw SVG diagram.
   - Output the SVG code inside a standard markdown code block labeled as "xml" or "svg" (using three backticks).
   - Ensure the SVG has viewBox, width="100%", height="auto", and looks premium (modern colors matching sepia/gold/emerald, rounded corners, clean fonts, sleek path arrows).
   - Use clean, modern colors like HSL tailored shades, sleek gradients, and crisp text. Make sure text is fully legible on dark/light background.
   - Never wrap SVG in markdown block tags other than "xml" or "svg".
2. Use markdown tables, bold highlights, bullet points, and checkmarks for structured textual insights.
3. Keep the tone helpful, encouraging, and highly academic.`;

    // Map conversation history directly to Gemini roles
    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      ...messages.map((m: any) => ({
        role: m.role === 'model' || m.role === 'assistant' ? 'model' : 'user',
        parts: [
          {
            text: m.content
          }
        ]
      }))
    ];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Gemini API Error:', errorData);
      return NextResponse.json(
        { error: `Gemini API returned an error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return NextResponse.json({ text: generatedText });
  } catch (error: any) {
    console.error('AI Proxy Route Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
