import { useState } from "react";
import type { FormEvent } from "react";
import type { PlaylistVideo, TranscriptLanguage } from "../types/transcript";

export function usePlaylist() {
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistError, setPlaylistError] = useState("");
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [selectedVideoTitle, setSelectedVideoTitle] = useState("");

  async function handlePlaylistSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!playlistUrl.trim()) {
      setPlaylistError("Please enter a YouTube playlist URL.");
      return;
    }

    setPlaylistLoading(true);
    setPlaylistError("");
    setPlaylistVideos([]);
    setSelectedVideoId("");

    try {
      const response = await fetch("/api/playlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: playlistUrl.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Could not load playlist.");
      }

      if (!data.videos || !Array.isArray(data.videos) || data.videos.length === 0) {
        throw new Error("No videos found in this playlist.");
      }

      setPlaylistVideos(data.videos);
    } catch (error) {
      setPlaylistError(
        error instanceof Error ? error.message : "Could not load playlist.",
      );
    } finally {
      setPlaylistLoading(false);
    }
  }

  function selectVideo(video: PlaylistVideo) {
    setSelectedVideoId(video.videoId);
    setSelectedVideoTitle(video.title);
  }

  function clearSelection() {
    setSelectedVideoId("");
    setSelectedVideoTitle("");
  }

  return {
    playlistUrl,
    setPlaylistUrl,
    playlistVideos,
    setPlaylistVideos,
    playlistLoading,
    playlistError,
    setPlaylistError,
    selectedVideoId,
    setSelectedVideoId,
    selectedVideoTitle,
    setSelectedVideoTitle,
    handlePlaylistSubmit,
    selectVideo,
    clearSelection,
  };
}

export async function detectPlaylistVideoLanguages(video: PlaylistVideo) {
  const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
  const response = await fetch("/api/transcript/languages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: videoUrl }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error || "Could not detect transcript languages.",
    );
  }

  const availableLanguages = data.languages as TranscriptLanguage[];
  if (!availableLanguages?.length) {
    throw new Error("No transcript languages found for this video.");
  }

  return availableLanguages;
}
