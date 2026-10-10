# YouTube Transcript

**Extract. Format. Translate. Download.**

A web application for extracting, formatting, translating, and downloading transcripts from YouTube videos and playlists. Built with Next.js and TypeScript, featuring multilingual caption support and AI-powered translation using Google Gemini.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Gemini AI Integration](#gemini-ai-integration)
- [Technology Stack](#technology-stack)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Security](#security)
- [Limitations](#limitations)
- [Deployment](#deployment)
- [Future Improvements](#future-improvements)
- [License](#license)

## Overview

YouTube Transcript simplifies the process of extracting and working with YouTube captions. Users can retrieve transcripts from individual videos or playlists, select available caption languages, improve transcript readability, and export the results as text files.

The project also integrates **Google Gemini AI** to provide transcript translation beyond the languages available in a video's original captions.

The application focuses on a straightforward workflow, a responsive interface, and server-side API routes that separate backend operations from the user interface.

## Features

<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Video Transcript Extraction</td>
      <td>Extract available captions from supported YouTube video URLs.</td>
    </tr>
    <tr>
      <td>Playlist Support</td>
      <td>Retrieve playlist videos and work with their transcripts individually.</td>
    </tr>
    <tr>
      <td>Language Detection</td>
      <td>Detect available manual and auto-generated caption tracks.</td>
    </tr>
    <tr>
      <td>Caption Track Selection</td>
      <td>Select a language and extract the corresponding transcript.</td>
    </tr>
    <tr>
      <td>Transcript Formatting</td>
      <td>Combine short caption fragments into more readable text.</td>
    </tr>
    <tr>
      <td>Timestamp Controls</td>
      <td>Include or remove timestamps from transcript output.</td>
    </tr>
    <tr>
      <td>Gemini AI Translation</td>
      <td>Translate transcript content using Google's Gemini API.</td>
    </tr>
    <tr>
      <td>Language-Aware Translation</td>
      <td>Exclude supported target languages that are already available as original caption tracks.</td>
    </tr>
    <tr>
      <td>Copy to Clipboard</td>
      <td>Copy transcript content for use in other applications.</td>
    </tr>
    <tr>
      <td>TXT Export</td>
      <td>Download transcript content as a <code>.txt</code> file.</td>
    </tr>
    <tr>
      <td>Responsive Interface</td>
      <td>Use the application on desktop and mobile-sized screens.</td>
    </tr>
    <tr>
      <td>No Account Required</td>
      <td>Access the tool without creating an application account.</td>
    </tr>
  </tbody>
</table>

## Gemini AI Integration

Gemini AI is one of the key features of this project. It extends the application beyond basic transcript extraction by enabling AI-powered translation into supported target languages.

### How Gemini is used

1. The user selects a target language for the transcript.
2. The application sends the transcript and translation settings to its server-side translation endpoint.
3. The server communicates with the Gemini API.
4. Gemini generates the translated text, which is returned to the application for the user to review, copy, or download.

### Why Gemini?

- **Context-aware translation:** Generative AI can interpret phrases in context rather than relying exclusively on word-for-word substitution.
- **Multilingual capabilities:** Translation can extend beyond the caption languages supplied directly by YouTube, depending on the selected model's capabilities.
- **Readable output:** Gemini can produce natural-language translations while preserving the intended meaning where possible.
- **Server-side integration:** The API key remains on the server and is not required in client-side code.

The application also checks which supported languages are already available as YouTube caption tracks and removes those languages from the translation options. This helps avoid unnecessary translation requests when the original captions already meet the user's needs.

> Translation quality depends on the source transcript, language pair, and selected Gemini model. Gemini API usage is subject to Google's availability, quotas, terms, and pricing.

## Technology Stack

<table>
  <thead>
    <tr>
      <th>Technology</th>
      <th>Purpose</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Next.js 16</td>
      <td>Application framework and server-side functionality</td>
    </tr>
    <tr>
      <td>React</td>
      <td>Interactive user interface</td>
    </tr>
    <tr>
      <td>TypeScript</td>
      <td>Type safety and maintainable application code</td>
    </tr>
    <tr>
      <td>Tailwind CSS</td>
      <td>Utility-first interface styling</td>
    </tr>
    <tr>
      <td>Google Gemini API</td>
      <td>AI-powered transcript translation</td>
    </tr>
    <tr>
      <td><code>@google/genai</code></td>
      <td>Gemini API integration</td>
    </tr>
    <tr>
      <td>Next.js Route Handlers</td>
      <td>Backend endpoints for transcript, playlist, and translation operations</td>
    </tr>
    <tr>
      <td>YouTube caption/transcript endpoints</td>
      <td>Discover and retrieve available transcript tracks</td>
    </tr>
  </tbody>
</table>

## How It Works

### Video Transcript Workflow

1. The user enters a YouTube video URL.
2. The application validates the URL and detects available caption tracks.
3. The user selects a caption language when multiple tracks are available.
4. The application extracts the transcript for the selected track.
5. The user can format the transcript, toggle timestamps, copy it, download it, or translate it with Gemini AI.

### Playlist Workflow

1. The user enters a YouTube playlist URL.
2. The application retrieves the playlist's video list.
3. The user selects a video.
4. The application detects the selected video's available caption tracks.
5. The transcript can then be extracted and processed using the available options.

### Translation Workflow

1. The user chooses a target language.
2. The application sends the transcript to the server-side translation route.
3. The route uses the Gemini API to generate the translation.
4. The translated transcript is returned to the interface.

## API Reference

The application uses Next.js Route Handlers to process its core operations.

<table>
  <thead>
    <tr>
      <th>Endpoint</th>
      <th>Method</th>
      <th>Responsibility</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>/api/transcript</code></td>
      <td><code>POST</code></td>
      <td>Extract a transcript for a video and selected caption track.</td>
    </tr>
    <tr>
      <td><code>/api/transcript/languages</code></td>
      <td><code>POST</code></td>
      <td>Detect the available transcript language tracks for a video.</td>
    </tr>
    <tr>
      <td><code>/api/playlist</code></td>
      <td><code>POST</code></td>
      <td>Retrieve videos from a YouTube playlist.</td>
    </tr>
    <tr>
      <td><code>/api/translate</code></td>
      <td><code>POST</code></td>
      <td>Translate transcript text using Gemini AI.</td>
    </tr>
  </tbody>
</table>

**Note:** Request and response payloads are implementation-specific and may evolve as the project develops.

## Project Structure

The application separates the interface, reusable hooks, shared utilities, types, and API routes to improve maintainability.

```
youtube-transcript/
├── app/
│   ├── api/
│   │   ├── playlist/
│   │   ├── transcript/
│   │   │   └── languages/
│   │   └── translate/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── page.tsx
│   └── ...
├── public/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

This is a high-level overview. Keep the directory listing synchronized with the actual repository if its structure changes.

## Getting Started

### Prerequisites

- Node.js compatible with the project's installed Next.js version
- npm
- A Gemini API key for translation functionality

### 1. Clone the Repository

Replace `YOUR_USERNAME` with your GitHub username.

```
git clone https://github.com/YOUR_USERNAME/youtube-transcript.git
cd youtube-transcript
```

### 2. Install Dependencies

```
npm install
```

### 3. Configure Environment Variables

Create a local environment file from the example:

**Windows Command Prompt**

```
copy .env.example .env.local
```

**PowerShell, macOS, or Linux**

```
cp .env.example .env.local
```

Add your Gemini API key to `.env.local`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```
npm run build
npm run start
```

## Environment Variables

<table>
  <thead>
    <tr>
      <th>Variable</th>
      <th>Required</th>
      <th>Description</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>GEMINI_API_KEY</code></td>
      <td>For translation</td>
      <td>Authenticates server-side requests to the Gemini API.</td>
    </tr>
  </tbody>
</table>

The repository includes an `.env.example` file containing a placeholder value. Each developer must provide their own API key in `.env.local`.

## Security

- Keep real credentials in `.env.local`.
- Never commit `.env.local` or other files containing secrets.
- Do not expose the Gemini API key through a `NEXT_PUBLIC_` environment variable.
- Keep API calls that require the secret on the server.
- If an API key is accidentally exposed, revoke it and replace it.

## Limitations

- Transcript extraction depends on the caption tracks accessible for a given video.
- Some videos may not provide captions or may restrict access to them.
- Changes to YouTube's underlying endpoints may affect extraction reliability.
- AI-generated translations may contain inaccuracies and should be reviewed for important use cases.
- Gemini requests are subject to rate limits, service availability, and applicable pricing.
- Playlist contents and transcript availability may vary between videos.

## Deployment

The application can be deployed to a hosting provider that supports Next.js, such as Vercel.

Recommended deployment steps:

1. Push the project to GitHub.
2. Import the repository into the hosting provider.
3. Configure `GEMINI_API_KEY` in the project's server-side environment variables.
4. Deploy the application.
5. Test video extraction, playlist processing, and Gemini translation in the deployed environment.

Never add the real API key to the repository or expose it to the browser.

## Future Improvements

Potential improvements include:

- Additional export formats, such as Markdown and SRT
- Transcript search and navigation
- Improved playlist processing and progress feedback
- Additional translation providers
- Automated tests for utility functions and API routes
- Accessibility and keyboard-navigation improvements
- A public live demo and additional project screenshots

## License

No open-source license has been added yet.


---

**YouTube Transcript** — Built with Next.js, TypeScript, and Gemini AI.
