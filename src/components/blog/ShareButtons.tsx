"use client";

import * as React from "react";
import { Link as LinkIcon, Mail, Check } from "lucide-react";

export interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(url);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-indigo">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-indigo hover:bg-saffron hover:text-white transition-colors min-h-[44px] min-w-[44px]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="currentColor"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.25 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-indigo hover:bg-saffron hover:text-white transition-colors min-h-[44px] min-w-[44px]"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396z" />
        </svg>
      </a>
      <a
        href={`mailto:?subject=${encodedTitle}&body=${encodedUrl}`}
        aria-label="Share via email"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-indigo hover:bg-saffron hover:text-white transition-colors min-h-[44px] min-w-[44px]"
      >
        <Mail size={18} />
      </a>
      <button
        type="button"
        onClick={copyLink}
        aria-label="Copy link"
        className="inline-flex h-10 items-center gap-2 rounded-full bg-cream text-indigo px-4 hover:bg-saffron hover:text-white transition-colors min-h-[44px]"
      >
        {copied ? <Check size={16} /> : <LinkIcon size={16} />}
        <span className="text-sm font-medium">
          {copied ? "Copied" : "Copy link"}
        </span>
      </button>
    </div>
  );
}
