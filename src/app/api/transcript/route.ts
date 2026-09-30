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

type TranscriptItem = {
  text: string;
  duration: number;
  offset: number;
};

function extractYouTubeVideoId(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();

    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const watchId = url.searchParams.get("v");

      if (watchId) {
        return watchId;
      }

      const shortsMatch = url.pathname.match(/^\/shorts\/([^/]+)/);

      if (shortsMatch) {
        return shortsMatch[1];
      }

      const embedMatch = url.pathname.match(/^\/embed\/([^/]+)/);

      if (embedMatch) {
        return embedMatch[1];
      }

      const vMatch = url.pathname.match(/^\/v\/([^/]+)/);

      if (vMatch) {
        return vMatch[1];
      }
    }

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

async function getCaptionTracks(videoId: string) {
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

  if (!Array.isArray(captionTracks) || captionTracks.length === 0) {
    throw new Error("No captions are available for this video.");
  }

  return captionTracks as CaptionTrack[];
}

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function parseTranscriptXml(xml: string): TranscriptItem[] {
  const items: TranscriptItem[] = [];

  /*
   * YouTube can return:
   *
   * <text start="0.00" dur="2.00">Hello</text>
   *
   * or srv3:
   *
   * <p t="0" d="2000">Hello</p>
   */

  // Classic format
  const classicRegex =
    /<text\b[^>]*\bstart="([^"]+)"[^>]*\bdur="([^"]+)"[^>]*>([\s\S]*?)<\/text>/g;

  let match: RegExpExecArray | null;

  while ((match = classicRegex.exec(xml)) !== null) {
    const offsetSeconds = Number(match[1]);
    const durationSeconds = Number(match[2]);

    if (!Number.isFinite(offsetSeconds)) {
      continue;
    }

    const text = decodeHtmlEntities(
      match[3]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
    ).trim();

    if (!text) {
      continue;
    }

    items.push({
      text,
      offset: Math.round(offsetSeconds * 1000),
      duration: Number.isFinite(durationSeconds)
        ? Math.round(durationSeconds * 1000)
        : 0,
    });
  }

  // srv3 format
  const srv3Regex =
    /<p\b[^>]*\bt="([^"]+)"[^>]*\bd="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g;

  while ((match = srv3Regex.exec(xml)) !== null) {
    const offsetMs = Number(match[1]);
    const durationMs = Number(match[2]);

    if (!Number.isFinite(offsetMs)) {
      continue;
    }

    const text = decodeHtmlEntities(
      match[3]
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
    ).trim();

    if (!text) {
      continue;
    }

    items.push({
      text,
      offset: Math.round(offsetMs),
      duration: Number.isFinite(durationMs)
        ? Math.round(durationMs)
        : 0,
    });
  }

  /*
   * srv3/classic can sometimes produce duplicated items.
   * Remove duplicates and sort by timestamp.
   */
  const unique = new Map<string, TranscriptItem>();

  for (const item of items) {
    const key = `${item.offset}-${item.text}`;

    if (!unique.has(key)) {
      unique.set(key, item);
    }
  }

  return Array.from(unique.values()).sort(
    (a, b) => a.offset - b.offset
  );
}

async function fetchCaptionTrack(
  track: CaptionTrack
): Promise<TranscriptItem[]> {
  if (!track.baseUrl) {
    throw new Error("Caption track URL is missing.");
  }

  const response = await fetch(track.baseUrl, {
    headers: {
      "User-Agent": INNERTUBE_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error("Could not download the selected caption track.");
  }

  const xml = await response.text();

  console.log(
    "Caption response:",
    xml.substring(0, 300)
  );

  return parseTranscriptXml(xml);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const url = body.url?.trim();
    const trackId = body.trackId?.trim();

    if (!url) {
      return Response.json(
        {
          success: false,
          error: "YouTube URL is required.",
        },
        { status: 400 }
      );
    }

    if (!trackId) {
      return Response.json(
        {
          success: false,
          error: "Please select a transcript language.",
        },
        { status: 400 }
      );
    }

    const videoId = extractYouTubeVideoId(url);

    if (!videoId) {
      return Response.json(
        {
          success: false,
          error: "Please enter a valid YouTube URL.",
        },
        { status: 400 }
      );
    }

    /*
     * Get the exact caption tracks from YouTube.
     */
    const captionTracks = await getCaptionTracks(videoId);

    /*
     * track-0 -> index 0
     * track-1 -> index 1
     * etc.
     */
    const trackIndex = Number(
      trackId.replace("track-", "")
    );

    if (
      !Number.isInteger(trackIndex) ||
      trackIndex < 0 ||
      trackIndex >= captionTracks.length
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid transcript language selection.",
        },
        { status: 400 }
      );
    }

    /*
     * IMPORTANT:
     * We use the EXACT track selected by the user.
     *
     * This solves the problem where:
     *
     * English
     * English (auto-generated)
     *
     * both have code "en".
     */
    const selectedTrack = captionTracks[trackIndex];

    console.log(
      "Selected track:",
      {
        trackIndex,
        languageCode: selectedTrack.languageCode,
        kind: selectedTrack.kind,
        name:
          selectedTrack.name?.simpleText ||
          selectedTrack.languageCode,
      }
    );

    const transcript =
      await fetchCaptionTrack(selectedTrack);

    if (!transcript.length) {
      return Response.json(
        {
          success: false,
          error: "The selected transcript is empty.",
        },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      transcript,
    });
  } catch (error) {
    console.error(
      "Transcript extraction error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Could not extract the selected transcript. Make sure captions are available.",
      },
      { status: 500 }
    );
  }
}