import type { PlaylistVideo, TranscriptLanguage } from "../types/transcript";

type Props = {
  video: PlaylistVideo | null;
  languages: TranscriptLanguage[];
  selectedTrack: TranscriptLanguage | null;
  loading: boolean;
  error: string;
  formatted: boolean;
  includeTimestamps: boolean;
  onFormattedChange: (value: boolean) => void;
  onTimestampsChange: (value: boolean) => void;
  onLanguageChange: (value: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export function PlaylistOptionsModal({
  video,
  languages,
  selectedTrack,
  loading,
  error,
  formatted,
  includeTimestamps,
  onFormattedChange,
  onTimestampsChange,
  onLanguageChange,
  onSave,
  onClose,
}: Props) {
  if (!video) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Playlist video</p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900">Transcript Options</h2>
            <p className="mt-1 line-clamp-2 text-sm text-neutral-500">{video.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="mb-5 rounded-xl bg-neutral-50 p-4">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-200 border-t-red-600" />
              <span className="text-sm text-neutral-500">Detecting transcript languages...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">Unable to load options</p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
          </div>
        )}

        {!loading && !error && selectedTrack && (
          <div className="space-y-5">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={formatted}
                onChange={(e) => onFormattedChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">Format transcript</span>
                <p className="mt-1 text-xs text-neutral-400">Combine captions into readable sentences</p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 transition hover:bg-neutral-50">
              <input
                type="checkbox"
                checked={includeTimestamps}
                onChange={(e) => onTimestampsChange(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
              />
              <div>
                <span className="text-sm font-medium text-neutral-800">Include timestamps</span>
                <p className="mt-1 text-xs text-neutral-400">Show the time before each line</p>
              </div>
            </label>

            <div>
              <label htmlFor="playlist-language" className="mb-2 block text-sm font-medium text-neutral-700">
                Transcript language
              </label>
              <select
                id="playlist-language"
                value={selectedTrack.id}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
              >
                {languages.map((language) => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                    {language.kind === "auto-generated" ? " (auto-generated)" : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onSave}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
              >
                Save & Extract
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
