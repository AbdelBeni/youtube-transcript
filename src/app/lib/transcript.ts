import type {
  FormattedTranscriptItem,
  TranscriptItem,
  TranscriptLanguage,
  TranslationLanguage,
} from "../types/transcript";

export const translationLanguages: TranslationLanguage[] = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "de", name: "Deutsch" },
  { code: "ar", name: "العربية" },
  { code: "pt", name: "Português" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "zh", name: "中文" },
];

export function getAvailableTranslationLanguages(
  availableLanguages: TranscriptLanguage[],
): TranslationLanguage[] {
  const availableCodes = new Set(
    availableLanguages.map((language) =>
      language.code.toLowerCase().split("-")[0],
    ),
  );

  return translationLanguages.filter(
    (language) => !availableCodes.has(language.code),
  );
}

export function formatTime(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      seconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatTranscript(
  transcript: TranscriptItem[],
): FormattedTranscriptItem[] {
  const result: FormattedTranscriptItem[] = [];
  let currentText = "";
  let currentTimestamp = 0;
  let previousItem: TranscriptItem | null = null;

  for (const item of transcript) {
    let text = item.text.trim();
    if (!text) continue;

    text = text
      .replace(/\[(music|applause|laughter|laughing|inaudible)\]/gi, "")
      .replace(/^>>\s*/g, "")
      .trim();

    if (!text) {
      previousItem = item;
      continue;
    }

    if (!currentText) {
      currentText = text;
      currentTimestamp = item.offset;
    } else {
      const gap = previousItem
        ? item.offset - (previousItem.offset + previousItem.duration)
        : 0;

      const tooLong = currentText.length >= 180;
      const longPause = gap >= 1500;
      const previousEndsSentence = /[.!?]$/.test(
        previousItem?.text.trim() || "",
      );

      if (longPause || tooLong || previousEndsSentence) {
        result.push({ timestamp: currentTimestamp, text: currentText });
        currentText = text;
        currentTimestamp = item.offset;
      } else {
        currentText += " " + text;
      }
    }

    previousItem = item;
  }

  if (currentText) {
    result.push({ timestamp: currentTimestamp, text: currentText });
  }

  return result;
}

export function isValidYouTubeUrl(value: string) {
  try {
    const parsedUrl = new URL(value);
    const hostname = parsedUrl.hostname.toLowerCase();

    return (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    );
  } catch {
    return false;
  }
}

export function getVideoUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
