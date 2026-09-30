const INNERTUBE_API_URL =
  "https://www.youtube.com/youtubei/v1/player?prettyPrint=false";

const INNERTUBE_CLIENT_VERSION = "20.10.38";

const INNERTUBE_USER_AGENT =
  `com.google.android.youtube/${INNERTUBE_CLIENT_VERSION} ` +
  `(Linux; U; Android 14)`;

type CaptionTrack = {
  baseUrl: string;
  name?: {
    simpleText?: string;
    runs?: { text: string }[];
  };
  languageCode?: string;
  kind?: string;
};

function extractYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    // youtube.com
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      // /watch?v=...
      const watchId = url.searchParams.get("v");

      if (watchId) {
        return watchId;
      }

      // /shorts/...
      const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);

      if (shortsMatch) {
        return shortsMatch[1];
      }

      // /embed/...
      const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);

      if (embedMatch) {
        return embedMatch[1];
      }

      // /v/...
      const vMatch = url.pathname.match(/^\/v\/([^/]+)/);

      if (vMatch) {
        return vMatch[1];
      }
    }

    // youtu.be/...
    if (
      hostname === "youtu.be" ||
      hostname === "www.youtu.be"
    ) {
      const id = url.pathname.split("/")[1];

      if (id) {
        return id;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const url = body.url?.trim();

    if (!url) {
      return Response.json(
        {
          success: false,
          error: "YouTube URL is required.",
        },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return Response.json(
        {
          success: false,
          error: "Invalid YouTube URL.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(INNERTUBE_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "User-Agent": INNERTUBE_USER_AGENT,
      },

      body: JSON.stringify({
        context: {
          client: {
            clientName: "ANDROID",
            clientVersion: INNERTUBE_CLIENT_VERSION,
          },
        },

        videoId,
      }),
    });

    if (!response.ok) {
      throw new Error("Could not contact YouTube.");
    }

    const data = await response.json();

    const captionTracks =
      data?.captions?.playerCaptionsTracklistRenderer
        ?.captionTracks;

    if (
      !Array.isArray(captionTracks) ||
      captionTracks.length === 0
    ) {
      return Response.json(
        {
          success: false,
          error: "No captions are available for this video.",
        },
        { status: 404 }
      );
    }

    const languages = (captionTracks as CaptionTrack[]).map(
        (track, index) => {
            const name =
            track.name?.simpleText ||
            track.name?.runs
                ?.map((run) => run.text)
                .join("") ||
            track.languageCode ||
            "Unknown";

            return {
            id: `track-${index}`,

            code: track.languageCode || "",

            name,

            kind:
                track.kind === "asr"
                ? "auto-generated"
                : "manual",

            baseUrl: track.baseUrl,
            };
        }
        );

    console.log("Available languages:", languages);

    return Response.json({
      success: true,
      videoId,
      languages,
    });
  } catch (error) {
    console.error(
      "Language detection error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Could not detect available transcript languages.",
      },
      { status: 500 }
    );
  }
}