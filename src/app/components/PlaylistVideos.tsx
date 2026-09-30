import type { PlaylistVideo } from "../types/transcript";

type Props = {
  videos: PlaylistVideo[];
  selectedVideoId: string;
  loading: boolean;
  detectingLanguages: boolean;
  onSelect: (video: PlaylistVideo) => void;
  onOptions: (video: PlaylistVideo) => void;
};

export function PlaylistVideos({
  videos,
  selectedVideoId,
  loading,
  detectingLanguages,
  onSelect,
  onOptions,
}: Props) {
  if (!videos.length) return null;

  return (
    <div className="mt-5 border-t border-neutral-200 pt-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-900">Playlist videos</h3>
        <span className="text-xs text-neutral-400">{videos.length} videos</span>
      </div>

      <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
        {videos.map((video, index) => {
          const selected = selectedVideoId === video.videoId;
          const disabled = loading || detectingLanguages;

          return (
            <div
              key={video.videoId}
              className={`flex items-start gap-2 rounded-xl border p-3 transition ${
                selected
                  ? "border-red-300 bg-red-50"
                  : "border-neutral-200 bg-neutral-50 hover:border-neutral-300 hover:bg-neutral-100"
              } ${disabled ? "opacity-60" : ""}`}
            >
              <button
                type="button"
                onClick={() => onSelect(video)}
                disabled={disabled}
                className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-not-allowed"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${
                      selected ? "bg-red-600 text-white" : "bg-neutral-200 text-neutral-500"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        selected ? "text-red-700" : "text-neutral-800"
                      }`}
                    >
                      {video.title}
                    </p>
                    {selected && (
                      <p className="mt-1 text-xs text-red-500">Currently selected</p>
                    )}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onOptions(video)}
                disabled={disabled}
                className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm text-neutral-500 shadow-sm transition hover:bg-neutral-50 hover:text-neutral-800 disabled:cursor-not-allowed"
                aria-label={`Options for ${video.title}`}
                title="Options"
              >
                ⚙️
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
