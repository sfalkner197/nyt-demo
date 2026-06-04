import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const create = client.messages.create.bind(client.messages) as any;

    const response = await create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: "You are a news briefing API. You must respond with only a valid JSON object — no preamble, no explanation, no markdown, no code fences. The very first character of your response must be { and the last must be }.",
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [
        {
          role: "user",
          content: `Write a news briefing on: "${topic}".

Return ONLY a JSON object with no markdown, no code fences, no preamble. Exactly this shape:
{
  "whatsHappened": [
    "**Bold key phrase**: rest of the bullet point.",
    "**Bold key phrase**: rest of the bullet point.",
    "**Bold key phrase**: rest of the bullet point."
  ],
  "disagreements": [
    "**Bold key phrase**: rest of the bullet point."
  ],
  "whatsNew": [
    {"text": "**Bold key phrase**: rest of the bullet point.", "sourceUrl": "https://..."}
  ],
  "whatsNext": [
    "**Bold key phrase**: rest of the bullet point."
  ],
  "sources": [
    {"outlet": "outlet name", "url": "https://..."}
  ]
}

Rules:
- whatsHappened: maximum 3 bullet points of essential background only. Be concise.
- disagreements: maximum 2 bullet points, or null if not applicable.
- whatsNew: ONLY developments from the last 24 hours. If nothing significant happened in the last 24 hours, return 1 item saying so. Every item must have a real source URL.
- whatsNext: 2-3 bullet points on what to watch for.
- Every bullet point must start with "**Bold key phrase**: " format.
- Use web search to find real, current information. Do not invent details.
- Even for vague or broad topics, always return the JSON structure. Interpret the topic as best you can.`,
        },
      ],
    });

    const textBlock = response.content.find((block: { type: string }) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text response from model");
    }

    const raw = (textBlock as { type: string; text: string }).text;
    const end = raw.lastIndexOf("}");
    let data = null;
    let searchFrom = 0;
    while (searchFrom < raw.length) {
      const start = raw.indexOf("{", searchFrom);
      if (start === -1 || start >= end) break;
      try {
        data = JSON.parse(raw.slice(start, end + 1));
        break;
      } catch {
        searchFrom = start + 1;
      }
    }
    if (!data) throw new Error("Try a more specific topic — the model couldn't generate a structured briefing for that query.");

    return NextResponse.json(data);
  } catch (error) {
    console.error("Briefing error:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      { error: `Failed to generate briefing: ${message}` },
      { status: 500 }
    );
  }
}
