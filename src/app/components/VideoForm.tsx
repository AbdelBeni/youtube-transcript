import type { FormEvent } from "react";
import type { TranscriptLanguage } from "../types/transcript";

type Props = {
  url: string;
  setUrl: (value: string) => void;
  formatted: boolean;
  setFormatted: (value: boolean) => void;
  includeTimestamps: boolean;
  setIncludeTimestamps: (value: boolean) => void;
  languages: TranscriptLanguage[];
  selectedTrack: TranscriptLanguage | null;
  loading: boolean;
  detectingLanguages: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<unknown>;
  onLanguageChange: (value: string) => void | Promise<unknown>;
  onResetSelection: () => void;
};

export function VideoForm({
  url,
  setUrl,
  formatted,
  setFormatted,
  includeTimestamps,
  setIncludeTimestamps,
  languages,
  selectedTrack,
  loading,
  detectingLanguages,
  onSubmit,
  onLanguageChange,
  onResetSelection,
}: Props) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="youtube-url" className="sr-only">
          YouTube video URL
        </label>
        <input
          id="youtube-url"
          name="youtube-url"
          type="url"
          inputMode="url"
          autoComplete="off"
          placeholder="Paste YouTube video URL"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            onResetSelection();
          }}
          required
          disabled={loading || detectingLanguages}
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={formatted}
            onChange={(e) => setFormatted(e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
          />
          <div>
            <span className="text-sm font-medium text-neutral-700">Format transcript</span>
            <p className="mt-0.5 text-xs text-neutral-400">
              Combine captions into readable sentences
            </p>
          </div>
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={includeTimestamps}
            onChange={(e) => setIncludeTimestamps(e.target.checked)}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-neutral-300 text-red-600 focus:ring-red-500"
          />
          <div>
            <span className="text-sm font-medium text-neutral-700">Include timestamps</span>
            <p className="mt-0.5 text-xs text-neutral-400">Show the time before each line</p>
          </div>
        </label>
      </div>

      {languages.length > 1 && (
        <div>
          <label
            htmlFor="language"
            className="mb-1.5 block text-sm font-medium text-neutral-700"
          >
            Transcript language
          </label>
          <select
            id="language"
            value={selectedTrack?.id || ""}
            onChange={(e) => onLanguageChange(e.target.value)}
            disabled={loading || detectingLanguages}
            className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {languages.map((language) => (
              <option key={language.id} value={language.id}>
                {language.name}
                {language.kind === "auto-generated" ? " (auto-generated)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {detectingLanguages && (
        <p className="text-sm text-neutral-400">Detecting available languages...</p>
      )}

      {languages.length === 1 && (
        <p className="text-sm text-neutral-500">
          Language: <span className="font-medium text-neutral-700">
            {languages[0].name}
            {languages[0].kind === "auto-generated" ? " (auto-generated)" : ""}
          </span>
        </p>
      )}

      <button
        type="submit"
        disabled={loading || detectingLanguages}
        className="w-full rounded-xl bg-red-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {detectingLanguages ? "Detecting languages..." : loading ? "Extracting..." : "Extract Transcript"}
      </button>
    </form>
  );
}
