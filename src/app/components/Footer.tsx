import Link from "next/link";

const productLinks = [
  { label: "YouTube Video", href: "#top" },
  { label: "YouTube Playlist", href: "#top" },
  { label: "Transcript Tools", href: "#faq" },
];

const resourceLinks = [
  { label: "FAQ", href: "#faq" },
  { label: "How It Works", href: "#faq" },
  { label: "YouTube", href: "https://www.youtube.com/", external: true },
];

const projectLinks = [
  { label: "Home", href: "#top" },
  { label: "Extract Transcript", href: "#top" },
  { label: "Playlist Extractor", href: "#top" },
];

function FooterLink({
  label,
  href,
  external,
}: {
  label: string;
  href: string;
  external?: boolean;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
      >
        {label}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="text-sm text-neutral-500 transition-colors hover:text-neutral-900"
    >
      {label}
    </Link>
  );
}

export function Footer() {
  return (
    <footer id="footer" className="w-full border-t border-neutral-200 bg-white sm:mt-24">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.7fr_1fr_1fr_1fr] lg:py-14">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="#top"
              className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-neutral-900"
            >
              YouTube Transcript
            </Link>

            <p className="mt-4 text-sm leading-6 text-neutral-500">
              A simple tool to extract, format, translate, copy, and download
              YouTube transcripts without creating an account.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-neutral-600">
                Free to use · No sign-up required
              </span>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Product</h3>
            <div className="mt-4 flex flex-col gap-3">
              {productLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Resources</h3>
            <div className="mt-4 flex flex-col gap-3">
              {resourceLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </div>
          </div>

          {/* Project */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Explore</h3>
            <div className="mt-4 flex flex-col gap-3">
              {projectLinks.map((link) => (
                <FooterLink key={link.label} {...link} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-neutral-200 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} YouTube Transcript. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-xs text-neutral-400">Built for simple transcript extraction.</span>
            <a
              href="https://www.youtube.com/"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium text-neutral-500 transition-colors hover:text-red-600"
            >
              Visit YouTube ↗
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
