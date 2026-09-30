const INNERTUBE_API_URL =
  "https://www.youtube.com/youtubei/v1/browse?prettyPrint=false";

const INNERTUBE_CLIENT_VERSION = "20.10.38";

const INNERTUBE_USER_AGENT =
  `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} ` +
  `(Linux; U; Android 14)`;

type PlaylistVideo = {
  videoId: string;
  title: string;
  position: number;
};

function extractPlaylistId(value: string) {
  try {
    const url = new URL(value);

    const hostname = url.hostname.toLowerCase();

    if (
      hostname !== "youtube.com" &&
      hostname !== "www.youtube.com" &&
      hostname !== "m.youtube.com"
    ) {
      return null;
    }

    return url.searchParams.get("list");
  } catch {
    return null;
  }
}

function getText(value: any): string {
  if (!value) return "";

  if (typeof value.simpleText === "string") {
    return value.simpleText;
  }

  if (Array.isArray(value.runs)) {
    return value.runs
      .map((run: any) => run.text || "")
      .join("");
  }

  return "";
}

function extractVideos(data: any): PlaylistVideo[] {
  const videos: PlaylistVideo[] = [];

  function walk(value: any) {
    if (!value || typeof value !== "object") {
      return;
    }

    if (value.playlistVideoRenderer) {
      const renderer = value.playlistVideoRenderer;

      const videoId = renderer.videoId;
      const title = getText(renderer.title);

      if (videoId && title) {
        videos.push({
          videoId,
          title,
          position: videos.length + 1,
        });
      }
    }

    for (const key of Object.keys(value)) {
      const child = value[key];

      if (child && typeof child === "object") {
        if (Array.isArray(child)) {
          for (const item of child) {
            walk(item);
          }
        } else {
          walk(child);
        }
      }
    }
  }

  walk(data);

  return videos;
}

function findContinuationToken(data: any): string | null {
  let token: string | null = null;

  function walk(value: any) {
    if (!value || typeof value !== "object" || token) {
      return;
    }

    if (value.continuationCommand?.token) {
      token = value.continuationCommand.token;
      return;
    }

    for (const key of Object.keys(value)) {
      const child = value[key];

      if (Array.isArray(child)) {
        for (const item of child) {
          walk(item);

          if (token) return;
        }
      } else if (child && typeof child === "object") {
        walk(child);

        if (token) return;
      }
    }
  }

  walk(data);

  return token;
}

async function fetchPlaylist(
  playlistId: string,
  continuation?: string
) {
  const body = continuation
    ? {
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: INNERTUBE_CLIENT_VERSION,
          },
        },
        continuation,
      }
    : {
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: INNERTUBE_CLIENT_VERSION,
          },
        },
        browseId: `VL${playlistId}`,
      };

  const response = await fetch(INNERTUBE_API_URL, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "User-Agent": INNERTUBE_USER_AGENT,
    },

    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Could not contact YouTube.");
  }

  return response.json();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const url = body.url?.trim();

    if (!url) {
      return Response.json(
        {
          success: false,
          error: "YouTube playlist URL is required.",
        },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(url);

    if (!playlistId) {
      return Response.json(
        {
          success: false,
          error: "Please enter a valid YouTube playlist URL.",
        },
        { status: 400 }
      );
    }

    const videos: PlaylistVideo[] = [];

    let continuation: string | null = null;

    // First request
    let data = await fetchPlaylist(playlistId);

    videos.push(...extractVideos(data));

    continuation = findContinuationToken(data);

    // Get remaining videos
    while (continuation && videos.length < 500) {
      data = await fetchPlaylist(
        playlistId,
        continuation
      );

      const newVideos = extractVideos(data);

      videos.push(...newVideos);

      const nextContinuation =
        findContinuationToken(data);

      if (
        !nextContinuation ||
        newVideos.length === 0
      ) {
        break;
      }

      continuation = nextContinuation;
    }

    // Remove duplicates
    const uniqueVideos = Array.from(
      new Map(
        videos.map((video) => [
          video.videoId,
          video,
        ])
      ).values()
    ).map((video, index) => ({
      ...video,
      position: index + 1,
    }));

    if (uniqueVideos.length === 0) {
      return Response.json(
        {
          success: false,
          error:
            "No videos were found in this playlist.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      playlistId,
      count: uniqueVideos.length,
      videos: uniqueVideos,
    });
  } catch (error) {
    console.error(
      "Playlist extraction error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Could not extract playlist.",
      },
      { status: 500 }
    );
  }
}