"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { PlaylistForm } from "./components/PlaylistForm";
import { PlaylistOptionsModal } from "./components/PlaylistOptionsModal";
import { PlaylistVideos } from "./components/PlaylistVideos";
import { TranscriptViewer } from "./components/TranscriptViewer";
import { TranslationModal } from "./components/TranslationModal";
import { VideoForm } from "./components/VideoForm";
import { usePlaylist, detectPlaylistVideoLanguages } from "./hooks/usePlaylist";
import { useTranscript } from "./hooks/useTranscript";
import { useTranslation } from "./hooks/useTranslation";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import {
  getVideoUrl,
} from "./lib/transcript";
import type {
  InputMode,
  PlaylistVideo,
  TranscriptLanguage,
} from "./types/transcript";

export default function HomePage() {
  const [inputMode, setInputMode] = useState<InputMode>("video");
  const [copied, setCopied] = useState(false);

  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const transcriptState = useTranscript();
  const playlist = usePlaylist();

  const translation = useTranslation(
    transcriptState.transcript,
    transcriptState.selectedTrack?.code,
    transcriptState.availableTranslationLanguages,
  );

  const [optionsVideo, setOptionsVideo] = useState<PlaylistVideo | null>(null);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [optionsFormatted, setOptionsFormatted] = useState(false);
  const [optionsIncludeTimestamps, setOptionsIncludeTimestamps] = useState(true);
  const [optionsLanguages, setOptionsLanguages] = useState<TranscriptLanguage[]>([]);
  const [optionsSelectedTrack, setOptionsSelectedTrack] =
    useState<TranscriptLanguage | null>(null);
  const [optionsError, setOptionsError] = useState("");

  const selectedPlaylistVideo = useMemo(
    () =>
      playlist.playlistVideos.find(
        (video) => video.videoId === playlist.selectedVideoId,
      ) ?? null,
    [playlist.playlistVideos, playlist.selectedVideoId],
  );

  useEffect(() => {
    if (inputMode === "playlist" && playlist.selectedVideoId && transcriptState.transcript.length > 0) {
      const timer = setTimeout(() => {
        transcriptRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [inputMode, playlist.selectedVideoId, transcriptState.transcript.length]);

  useEffect(() => {
    if (
      transcriptState.availableTranslationLanguages.length > 0 &&
      !transcriptState.availableTranslationLanguages.some(
        (language) => language.code === translation.translationLanguage,
      )
    ) {
      translation.setTranslationLanguage(
        transcriptState.availableTranslationLanguages[0].code,
      );
    }
  }, [
    transcriptState.availableTranslationLanguages,
    translation.translationLanguage,
    translation.setTranslationLanguage,
  ]);

  async function loadLanguagesForUrl(value: string) {
    return transcriptState.detectLanguages(value);
  }

  function resetOutput() {
    transcriptState.setTranscript([]);
    translation.resetTranslation();
  }

  function switchToVideo() {
    setInputMode("video");
    playlist.setPlaylistUrl("");
    playlist.setPlaylistError("");
    playlist.setPlaylistVideos([]);
    playlist.clearSelection();
    transcriptState.setError("");
    transcriptState.resetTranscript();
    resetOutput();
  }

  function switchToPlaylist() {
    setInputMode("playlist");
    transcriptState.setUrl("");
    transcriptState.setError("");
    transcriptState.resetTranscript();
    resetOutput();
    playlist.clearSelection();
  }

  function handleVideoUrlChange(value: string) {
    transcriptState.setUrl(value);
    transcriptState.resetTranscript();
    resetOutput();
    playlist.clearSelection();
    transcriptState.setError("");
  }

  async function handlePlaylistVideoClick(video: PlaylistVideo) {
    const videoUrl = getVideoUrl(video.videoId);

    playlist.selectVideo(video);
    transcriptState.setUrl(videoUrl);
    transcriptState.setTranscript([]);
    transcriptState.setLanguages([]);
    transcriptState.setSelectedTrack(null);
    transcriptState.setError("");
    translation.resetTranslation();

    try {
      const languages = await loadLanguagesForUrl(videoUrl);
      if (!languages) return;

      transcriptState.setSelectedTrack(languages);
      await transcriptState.extractTranscriptForUrl(videoUrl, languages);
    } catch (error) {
      transcriptState.setError(
        error instanceof Error ? error.message : "Could not extract transcript.",
      );
    }
  }

  async function handleOpenPlaylistOptions(video: PlaylistVideo) {
    setOptionsVideo(video);
    setOptionsFormatted(transcriptState.formatted);
    setOptionsIncludeTimestamps(transcriptState.includeTimestamps);
    setOptionsLanguages([]);
    setOptionsSelectedTrack(null);
    setOptionsError("");
    setOptionsLoading(true);

    try {
      const languages = await detectPlaylistVideoLanguages(video);
      setOptionsLanguages(languages);
      setOptionsSelectedTrack(languages[0]);
    } catch (error) {
      console.error("Options language detection error:", error);
      setOptionsError(
        error instanceof Error
          ? error.message
          : "Could not detect transcript languages.",
      );
    } finally {
      setOptionsLoading(false);
    }
  }

  async function handleSavePlaylistOptions() {
    if (!optionsVideo || !optionsSelectedTrack) return;

    const videoUrl = getVideoUrl(optionsVideo.videoId);
    transcriptState.setFormatted(optionsFormatted);
    transcriptState.setIncludeTimestamps(optionsIncludeTimestamps);
    playlist.selectVideo(optionsVideo);
    transcriptState.setUrl(videoUrl);
    transcriptState.setError("");
    transcriptState.setTranscript([]);
    translation.resetTranslation();
    setOptionsVideo(null);

    await transcriptState.extractTranscriptForUrl(videoUrl, optionsSelectedTrack);
  }

  async function handleCopy() {
    const text = transcriptState.createTranscriptText(
      translation.isTranslated,
      translation.translatedTranscript,
    );

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    const text = transcriptState.createTranscriptText(
      translation.isTranslated,
      translation.translatedTranscript,
    );

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = downloadUrl;
    a.download = "youtube-transcript.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <main className="flex min-h-screen flex-col items-center bg-neutral-50 px-4 py-16 sm:py-24 !pb-0">
      <div className="flex w-full max-w-xl flex-1 flex-col items-center justify-center">
        <div className="mb-8 text-center sm:mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            YouTube Transcript
          </h1>
          <p className="mt-3 text-base text-neutral-500 sm:text-lg">
            Extract the transcript from any YouTube video.
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
          <div className="border-b border-neutral-200 bg-neutral-100 p-1.5">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={switchToVideo}
                className={`flex items-center justify-center gap-[10px] rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  inputMode === "video"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <span aria-hidden="true">
                  <svg width={26} viewBox="0 0 48 48" id="a" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>{`.b{fill:none;stroke:#e7000b;stroke-linecap:round;stroke-linejoin:round;}`}</style></defs><g><line className="b" x1="12" y1="39" x2="36" y2="39"></line><rect className="b" x="4.5" y="9" width="39" height="26" rx="2" ry="2"></rect></g><polygon className="b" points="29.8597 22 20.1403 16.404 20.1403 27.596 29.8597 22"></polygon></g></svg>
                </span>
                YouTube Video
              </button>

              <button
                type="button"
                onClick={switchToPlaylist}
                className={`flex items-center justify-center gap-[10px] rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  inputMode === "playlist"
                    ? "bg-white text-red-600 shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <span aria-hidden="true">
                  <svg width={26} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M21 7V19C21 20.1046 20.1046 21 19 21H7M9 8.5V11.5L12 10L9 8.5ZM17 15V5C17 3.89543 16.1046 3 15 3H5C3.89543 3 3 3.89543 3 5V15C3 16.1046 3.89543 17 5 17H15C16.1046 17 17 16.1046 17 15Z" stroke="#e7000b" strokeWidth="0.576" strokeLinecap="round" strokeLinejoin="round"></path></g></svg>
                </span>
                YouTube Playlist
              </button>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            {inputMode === "video" ? (
              <VideoForm
                url={transcriptState.url}
                setUrl={handleVideoUrlChange}
                formatted={transcriptState.formatted}
                setFormatted={transcriptState.setFormatted}
                includeTimestamps={transcriptState.includeTimestamps}
                setIncludeTimestamps={transcriptState.setIncludeTimestamps}
                languages={transcriptState.languages}
                selectedTrack={transcriptState.selectedTrack}
                loading={transcriptState.loading}
                detectingLanguages={transcriptState.detectingLanguages}
                onSubmit={transcriptState.handleSubmit}
                onLanguageChange={transcriptState.handleLanguageChange}
                onResetSelection={() => {
                  translation.resetTranslation();
                }}
              />
            ) : (
              <>
                <PlaylistForm
                  playlistUrl={playlist.playlistUrl}
                  setPlaylistUrl={(value) => {
                    playlist.setPlaylistUrl(value);
                    playlist.setPlaylistError("");
                  }}
                  playlistLoading={playlist.playlistLoading}
                  loading={transcriptState.loading}
                  onSubmit={playlist.handlePlaylistSubmit}
                />

                {playlist.playlistError && (
                  <p className="mt-3 text-sm text-red-600">{playlist.playlistError}</p>
                )}

                <PlaylistVideos
                  videos={playlist.playlistVideos}
                  selectedVideoId={playlist.selectedVideoId}
                  loading={transcriptState.loading}
                  detectingLanguages={transcriptState.detectingLanguages}
                  onSelect={handlePlaylistVideoClick}
                  onOptions={handleOpenPlaylistOptions}
                />
              </>
            )}
          </div>
        </div>

        {transcriptState.error && (
          <div role="alert" className="mt-6 w-full rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-medium text-red-700">Unable to extract transcript</p>
            <p className="mt-1 text-sm text-red-600">{transcriptState.error}</p>
          </div>
        )}

        <div ref={transcriptRef} className="w-full">
          <TranscriptViewer
            transcript={transcriptState.transcript}
            translatedTranscript={translation.translatedTranscript}
            formattedTranscript={transcriptState.formattedTranscript}
            formattedTranslatedTranscript={translation.formattedTranslatedTranscript}
            isTranslated={translation.isTranslated}
            formatted={transcriptState.formatted}
            includeTimestamps={transcriptState.includeTimestamps}
            selectedVideoId={playlist.selectedVideoId}
            selectedVideoTitle={playlist.selectedVideoTitle}
            selectedPlaylistVideo={selectedPlaylistVideo}
            playlistVideos={playlist.playlistVideos}
            loading={transcriptState.loading}
            detectingLanguages={transcriptState.detectingLanguages}
            optionsLoading={optionsLoading}
            translationLoading={translation.translationLoading}
            copied={copied}
            onOptions={handleOpenPlaylistOptions}
            onOpenTranslation={translation.openTranslation}
            onShowOriginal={() => translation.setIsTranslated(false)}
            onCopy={handleCopy}
            onDownload={handleDownload}
          />
        </div>

        <div
          role="complementary"
          aria-label="Advertisement"
          className="mt-10 flex w-full min-h-[100px] items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-100/60 text-sm text-neutral-400 sm:min-h-[120px]"
        >
          Ad space
        </div>
      </div>

      <TranslationModal
        open={translation.translationOpen}
        languages={transcriptState.availableTranslationLanguages}
        selectedLanguage={translation.translationLanguage}
        loading={translation.translationLoading}
        error={translation.translationError}
        onLanguageChange={translation.setTranslationLanguage}
        onTranslate={translation.handleTranslate}
        onClose={() => translation.setTranslationOpen(false)}
      />

      <PlaylistOptionsModal
        video={optionsVideo}
        languages={optionsLanguages}
        selectedTrack={optionsSelectedTrack}
        loading={optionsLoading}
        error={optionsError}
        formatted={optionsFormatted}
        includeTimestamps={optionsIncludeTimestamps}
        onFormattedChange={setOptionsFormatted}
        onTimestampsChange={setOptionsIncludeTimestamps}
        onLanguageChange={(value) => {
          const track = optionsLanguages.find((language) => language.id === value);
          if (track) setOptionsSelectedTrack(track);
        }}
        onSave={handleSavePlaylistOptions}
        onClose={() => setOptionsVideo(null)}
      />

      <FAQ />
      <Footer />
    </main>
  );
}
