import type { TranslationLanguage } from "../types/transcript";

type Props = {
  open: boolean;
  languages: TranslationLanguage[];
  selectedLanguage: string;
  loading: boolean;
  error: string;
  onLanguageChange: (value: string) => void;
  onTranslate: () => void;
  onClose: () => void;
};

export function TranslationModal({
  open,
  languages,
  selectedLanguage,
  loading,
  error,
  onLanguageChange,
  onTranslate,
  onClose,
}: Props) {
  if (!open) return null;

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
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">Transcript</p>
            <h2 className="mt-1 text-lg font-semibold text-neutral-900">Translate Transcript</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Choose the language you want to translate the transcript into.
            </p>
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

        <div className="space-y-2">
          <label htmlFor="translation-language" className="block text-sm font-medium text-neutral-700">
            Translate to
          </label>

          {languages.length === 0 ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <p className="text-sm font-medium text-neutral-700">All supported languages are already available.</p>
              <p className="mt-1 text-xs text-neutral-500">
                YouTube already provides transcripts in all languages supported by this translator.
              </p>
            </div>
          ) : (
            <select
              id="translation-language"
              value={selectedLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl border border-neutral-200 px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onTranslate}
            disabled={loading || languages.length === 0}
            className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>
      </div>
    </div>
  );
}
