import type {
  FormattedTranscriptItem,
  PlaylistVideo,
  TranscriptItem,
} from "../types/transcript";
import { formatTime } from "../lib/transcript";

type Props = {
  transcript: TranscriptItem[];
  translatedTranscript: TranscriptItem[];
  formattedTranscript: FormattedTranscriptItem[];
  formattedTranslatedTranscript: FormattedTranscriptItem[];
  isTranslated: boolean;
  formatted: boolean;
  includeTimestamps: boolean;
  selectedVideoId: string;
  selectedVideoTitle: string;
  selectedPlaylistVideo: PlaylistVideo | null;
  playlistVideos: PlaylistVideo[];
  loading: boolean;
  detectingLanguages: boolean;
  optionsLoading: boolean;
  translationLoading: boolean;
  copied: boolean;
  onOptions: (video: PlaylistVideo) => void;
  onOpenTranslation: () => void;
  onShowOriginal: () => void;
  onCopy: () => void;
  onDownload: () => void;
};

export function TranscriptViewer({
  transcript,
  translatedTranscript,
  formattedTranscript,
  formattedTranslatedTranscript,
  isTranslated,
  formatted,
  includeTimestamps,
  selectedVideoId,
  selectedVideoTitle,
  selectedPlaylistVideo,
  playlistVideos,
  loading,
  detectingLanguages,
  optionsLoading,
  translationLoading,
  copied,
  onOptions,
  onOpenTranslation,
  onShowOriginal,
  onCopy,
  onDownload,
}: Props) {
  if (!transcript.length) return null;

  const items = formatted
    ? isTranslated
      ? formattedTranslatedTranscript
      : formattedTranscript
    : isTranslated
      ? translatedTranscript
      : transcript;

  return (
    <div className="mt-8 w-full scroll-mt-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm sm:p-6">
      {selectedVideoId && (
        <div className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-semibold text-white">
              {playlistVideos.findIndex((video) => video.videoId === selectedVideoId) + 1}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Playlist video</p>
              <h2 className="mt-1 text-sm font-semibold text-neutral-900">{selectedVideoTitle}</h2>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-neutral-900">Transcript</h2>
        <div className="flex flex-wrap justify-end gap-2">
          {selectedPlaylistVideo && (
            <button
              type="button"
              onClick={() => onOptions(selectedPlaylistVideo)}
              disabled={loading || detectingLanguages || optionsLoading}
              className="rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-500 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Options for ${selectedPlaylistVideo.title}`}
              title="Options"
            >
              ⚙️
            </button>
          )}

          <button
            type="button"
            onClick={onOpenTranslation}
            disabled={loading || translationLoading}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Translate
          </button>

          {isTranslated && (
            <button
              type="button"
              onClick={onShowOriginal}
              className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
            >
              Show Original
            </button>
          )}

          <button
            type="button"
            onClick={onCopy}
            disabled={loading}
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            type="button"
            onClick={onDownload}
            disabled={loading}
            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 disabled:opacity-50"
          >
            Download TXT
          </button>
        </div>
      </div>

      <div className="max-h-[500px] space-y-4 overflow-y-auto">
        {items.map((item, index) => {
          const timestamp = formatted
            ? (item as FormattedTranscriptItem).timestamp
            : (item as TranscriptItem).offset;

          return (
            <div key={index} className="flex gap-3">
              {includeTimestamps && (
                <span className="shrink-0 font-mono text-xs text-neutral-400">
                  {formatTime(timestamp)}
                </span>
              )}
              <p className="text-sm leading-6 text-neutral-700">{item.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
