import { useMemo, useState } from "react";
import { formatTranscript, translationLanguages } from "../lib/transcript";
import type { TranscriptItem, TranslationLanguage } from "../types/transcript";

export function useTranslation(
  transcript: TranscriptItem[],
  sourceLanguage?: string,
  availableLanguages: TranslationLanguage[] = translationLanguages,
) {
  const [translatedTranscript, setTranslatedTranscript] = useState<
    TranscriptItem[]
  >([]);
  const [translationLanguage, setTranslationLanguage] = useState(
    availableLanguages[0]?.code || "",
  );
  const [translationOpen, setTranslationOpen] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const [isTranslated, setIsTranslated] = useState(false);

  const formattedTranslatedTranscript = useMemo(
    () => formatTranscript(translatedTranscript),
    [translatedTranscript],
  );

  async function handleTranslate() {
    if (!transcript.length || !translationLanguage) return;

    setTranslationLoading(true);
    setTranslationError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetLanguage: translationLanguage,
          sourceLanguage,
          transcript: transcript.map((item) => ({
            text: item.text,
            offset: item.offset,
            duration: item.duration,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not translate transcript.");
      }

      if (!data.transcript || !Array.isArray(data.transcript)) {
        throw new Error("Invalid translation response.");
      }

      setTranslatedTranscript(data.transcript);
      setIsTranslated(true);
      setTranslationOpen(false);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslationError(
        error instanceof Error
          ? error.message
          : "Could not translate transcript.",
      );
    } finally {
      setTranslationLoading(false);
    }
  }

  function resetTranslation() {
    setTranslatedTranscript([]);
    setIsTranslated(false);
    setTranslationError("");
  }

  function openTranslation() {
    setTranslationError("");
    setTranslationOpen(true);
  }

  return {
    translatedTranscript,
    setTranslatedTranscript,
    translationLanguage,
    setTranslationLanguage,
    translationOpen,
    setTranslationOpen,
    translationLoading,
    translationError,
    isTranslated,
    setIsTranslated,
    formattedTranslatedTranscript,
    handleTranslate,
    resetTranslation,
    openTranslation,
  };
}
