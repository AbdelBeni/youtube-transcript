export type InputMode = "video" | "playlist";

export type TranscriptItem = {
  text: string;
  duration: number;
  offset: number;
};

export type FormattedTranscriptItem = {
  timestamp: number;
  text: string;
};

export type TranscriptLanguage = {
  id: string;
  code: string;
  name: string;
  kind: "manual" | "auto-generated";
  baseUrl: string;
};

export type TranslationLanguage = {
  code: string;
  name: string;
};

export type PlaylistVideo = {
  videoId: string;
  title: string;
  position: number;
};
