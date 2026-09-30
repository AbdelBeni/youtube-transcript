import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

type TranscriptItem = {
  text: string;
  duration: number;
  offset: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const transcript = body.transcript as TranscriptItem[];
    const targetLanguage = body.targetLanguage as string;
    const sourceLanguage = body.sourceLanguage as string;

    if (!Array.isArray(transcript) || transcript.length === 0) {
      return NextResponse.json(
        { error: "Transcript is required." },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { error: "Target language is required." },
        { status: 400 }
      );
    }

    if (!sourceLanguage) {
      return NextResponse.json(
        { error: "Source language is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const source = sourceLanguage
      .toLowerCase()
      .split("-")[0];

    const target = targetLanguage
      .toLowerCase()
      .split("-")[0];

    if (source === target) {
      return NextResponse.json({
        transcript,
      });
    }

    /*
     * Combine the complete transcript into chunks.
     * We keep timestamps separately so Gemini only
     * translates the actual text.
     */

    const MAX_CHUNK_LENGTH = 8000;

    const chunks: {
      startIndex: number;
      endIndex: number;
      text: string;
    }[] = [];

    let currentTexts: string[] = [];
    let startIndex = -1;
    let currentLength = 0;

    for (let i = 0; i < transcript.length; i++) {
      const text = transcript[i].text.trim();

      if (!text) continue;

      if (startIndex === -1) {
        startIndex = i;
      }

      const additionalLength =
        currentTexts.length > 0
          ? text.length + 1
          : text.length;

      if (
        currentTexts.length > 0 &&
        currentLength + additionalLength > MAX_CHUNK_LENGTH
      ) {
        chunks.push({
          startIndex,
          endIndex: i - 1,
          text: currentTexts.join(" "),
        });

        currentTexts = [text];
        currentLength = text.length;
        startIndex = i;
      } else {
        currentTexts.push(text);
        currentLength += additionalLength;
      }
    }

    if (
      currentTexts.length > 0 &&
      startIndex !== -1
    ) {
      chunks.push({
        startIndex,
        endIndex: transcript.length - 1,
        text: currentTexts.join(" "),
      });
    }

    /*
     * Translate each chunk with Gemini.
     */

    const translatedChunks: string[] = [];

    for (const chunk of chunks) {
      const prompt = `
Translate the following transcript from ${source} to ${target}.

IMPORTANT RULES:
- Translate ONLY the provided text.
- Do NOT invent information.
- Do NOT summarize.
- Do NOT add explanations.
- Preserve the exact meaning.
- Keep technical terms accurate.
- Return ONLY the translation.
- The text may contain spoken language, slang, names, and technical terms.

TEXT:
${chunk.text}
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      const translatedText =
        response.text?.trim();

      if (!translatedText) {
        throw new Error(
          "Gemini returned an empty translation."
        );
      }

      translatedChunks.push(translatedText);
    }

    /*
     * Rebuild transcript while preserving timestamps.
     */

    const translatedTranscript: TranscriptItem[] =
      [];

    chunks.forEach((chunk, index) => {
      const first =
        transcript[chunk.startIndex];

      const last =
        transcript[chunk.endIndex];

      translatedTranscript.push({
        text: translatedChunks[index],
        offset: first.offset,
        duration:
          last.offset +
          last.duration -
          first.offset,
      });
    });

    return NextResponse.json({
      transcript: translatedTranscript,
    });
  } catch (error) {
    console.error(
      "Gemini translation error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not translate transcript.",
      },
      { status: 500 }
    );
  }
}