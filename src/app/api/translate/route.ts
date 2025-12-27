import { NextResponse } from "next/server";
import { translate } from "@vitalets/google-translate-api";

const politeWrap = (translation: string) =>
  `Thank you for your question. Here is a simple English reply: ${translation}`;

export async function POST(request: Request) {
  try {
    const { question } = (await request.json()) as { question?: string };

    if (!question || !question.trim()) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 },
      );
    }

    const { text } = await translate(question, { to: "en" });
    const translation = text.trim();

    return NextResponse.json({
      translation,
      reply: politeWrap(translation),
    });
  } catch (error) {
    console.error("[api:translate]", error);
    return NextResponse.json(
      {
        error:
          "Unable to translate right now. Please submit your question again soon.",
      },
      { status: 500 },
    );
  }
}
