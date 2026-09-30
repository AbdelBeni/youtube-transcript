import type { FormEvent } from "react";

type Props = {
  playlistUrl: string;
  setPlaylistUrl: (value: string) => void;
  playlistLoading: boolean;
  loading: boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<unknown>;
};

export function PlaylistForm({
  playlistUrl,
  setPlaylistUrl,
  playlistLoading,
  loading,
  onSubmit,
}: Props) {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-semibold text-neutral-900">YouTube Playlist</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Extract transcripts from videos in a playlist.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          type="url"
          placeholder="Paste YouTube playlist URL"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          disabled={playlistLoading || loading}
          className="w-full rounded-xl border border-neutral-300 bg-neutral-50 px-4 py-3.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={playlistLoading || loading}
          className="w-full rounded-xl bg-neutral-900 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {playlistLoading ? "Loading playlist..." : "Get Playlist"}
        </button>
      </form>
    </div>
  );
}
