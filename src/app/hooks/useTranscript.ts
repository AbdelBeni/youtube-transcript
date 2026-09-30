import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import {
  formatTranscript,
  getAvailableTranslationLanguages,
  isValidYouTubeUrl,
} from "../lib/transcript";

import type {
  TranscriptItem,
  TranscriptLanguage,
  TranslationLanguage,
} from "../types/transcript";

export function useTranscript() {
  const [url, setUrl] = useState<string>("");

  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);

  const [languages, setLanguages] = useState<TranscriptLanguage[]>([]);

  const [selectedTrack, setSelectedTrack] =
    useState<TranscriptLanguage | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [detectingLanguages, setDetectingLanguages] =
    useState<boolean>(false);

  const [error, setError] = useState<string>("");

  const [formatted, setFormatted] = useState<boolean>(false);

  const [includeTimestamps, setIncludeTimestamps] =
    useState<boolean>(true);

  const [
    availableTranslationLanguages,
    setAvailableTranslationLanguages,
  ] = useState<TranslationLanguage[]>(
    getAvailableTranslationLanguages([]),
  );

  const formattedTranscript = useMemo(
    () => formatTranscript(transcript),
    [transcript],
  );

  function resetTranscript() {
    setTranscript([]);
    setLanguages([]);
    setSelectedTrack(null);
  }

  function resetOutput() {
    setTranscript([]);
    setError("");
  }

  async function extractTranscriptForUrl(
    transcriptUrl: string,
    track: TranscriptLanguage,
  ): Promise<TranscriptItem[] | null> {
    setLoading(true);
    setError("");
    setTranscript([]);

    try {
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: transcriptUrl,
          trackId: track.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not extract transcript.",
        );
      }

      if (
        !data.transcript ||
        !Array.isArray(data.transcript) ||
        data.transcript.length === 0
      ) {
        throw new Error("The selected transcript is empty.");
      }

      const extractedTranscript =
        data.transcript as TranscriptItem[];

      setTranscript(extractedTranscript);

      return extractedTranscript;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not extract transcript.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  }

  async function detectLanguages(
    value: string = url,
  ): Promise<TranscriptLanguage | null> {
    const cleanUrl = value.trim();

    if (!isValidYouTubeUrl(cleanUrl)) {
      setError("Please enter a valid YouTube URL.");
      return null;
    }

    setDetectingLanguages(true);
    setError("");
    setTranscript([]);
    setLanguages([]);
    setSelectedTrack(null);

    try {
      const response = await fetch("/api/transcript/languages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: cleanUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not detect available languages.",
        );
      }

      if (
        !data.languages ||
        !Array.isArray(data.languages) ||
        data.languages.length === 0
      ) {
        throw new Error("No transcript languages found.");
      }

      const availableLanguages =
        data.languages as TranscriptLanguage[];

      const firstTrack = availableLanguages[0];

      setLanguages(availableLanguages);
      setSelectedTrack(firstTrack);

      setAvailableTranslationLanguages(
        getAvailableTranslationLanguages(
          availableLanguages,
        ),
      );

      return firstTrack;
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not detect available languages.",
      );

      return null;
    } finally {
      setDetectingLanguages(false);
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>,
  ): Promise<TranscriptItem[] | null> {
    e.preventDefault();

    const cleanUrl = url.trim();

    if (!isValidYouTubeUrl(cleanUrl)) {
      setError("Please enter a valid YouTube URL.");
      return null;
    }

    setError("");
    resetOutput();

    if (selectedTrack && languages.length > 0) {
      return extractTranscriptForUrl(
        cleanUrl,
        selectedTrack,
      );
    }

    setLoading(true);

    const firstTrack = await detectLanguages(cleanUrl);

    if (!firstTrack) {
      setLoading(false);
      return null;
    }

    return extractTranscriptForUrl(
      cleanUrl,
      firstTrack,
    );
  }

  async function handleLanguageChange(
    value: string,
  ): Promise<TranscriptItem[] | null> {
    const track = languages.find(
      (language) => language.id === value,
    );

    if (!track) {
      return null;
    }

    setSelectedTrack(track);

    return extractTranscriptForUrl(
      url.trim(),
      track,
    );
  }

  function createTranscriptText(
    isTranslated: boolean,
    translatedTranscript: TranscriptItem[],
  ): string {
    const currentTranscript = isTranslated
      ? translatedTranscript
      : transcript;

    const currentFormattedTranscript =
      formatTranscript(currentTranscript);

    if (formatted) {
      return currentFormattedTranscript
        .map((item) => {
          if (includeTimestamps) {
            return `[${formatTimeForExport(
              item.timestamp,
            )}] ${item.text}`;
          }

          return item.text;
        })
        .join("\n\n");
    }

    return currentTranscript
      .map((item) => {
        if (includeTimestamps) {
          return `[${formatTimeForExport(
            item.offset,
          )}] ${item.text}`;
        }

        return item.text;
      })
      .join("\n\n");
  }

  return {
    url,
    setUrl,

    transcript,
    setTranscript,

    languages,
    setLanguages,

    selectedTrack,
    setSelectedTrack,

    loading,
    detectingLanguages,

    error,
    setError,

    formatted,
    setFormatted,

    includeTimestamps,
    setIncludeTimestamps,

    formattedTranscript,

    availableTranslationLanguages,
    setAvailableTranslationLanguages,

    resetTranscript,
    resetOutput,

    extractTranscriptForUrl,
    detectLanguages,
    handleSubmit,
    handleLanguageChange,

    createTranscriptText,
  };
}

function formatTimeForExport(
  milliseconds: number,
): string {
  const totalSeconds = Math.floor(
    milliseconds / 1000,
  );

  const hours = Math.floor(
    totalSeconds / 3600,
  );

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60,
  );

  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(
      2,
      "0",
    )}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(
    2,
    "0",
  )}`;
}