"use client";

import { useState } from "react";

const faqItems = [
  {
    question: "What is YouTube Transcript?",
    answer:
      "YouTube Transcript is a simple tool that lets you extract the transcript or captions from a YouTube video and view the text with timestamps.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes. The tool is designed to be free to use and does not require an account or subscription.",
  },
  {
    question: "Can I choose the transcript language?",
    answer:
      "Yes. When a video has multiple caption tracks, you can choose the language you want before extracting the transcript.",
  },
  {
    question: "Can I use it with YouTube playlists?",
    answer:
      "Yes. Paste a YouTube playlist URL to load its videos, then select a video to extract its transcript.",
  },
  {
    question: "Can I download the transcript?",
    answer:
      "Yes. You can copy the transcript or download it as a TXT file. You can also choose whether to include timestamps and use the formatted transcript option.",
  },
  {
    question: "Can I translate a transcript?",
    answer:
      "Yes. When a translation language is not already available on YouTube for the selected video, you can translate the transcript into a supported language.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      aria-labelledby="faq-title"
      className="mt-20 w-full max-w-3xl px-1 sm:mt-24"
    >
      <div className="mb-8 text-center">
        <p className="text-sm font-medium text-red-600">FAQ</p>
        <h2
          id="faq-title"
          className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
        >
          Frequently asked questions
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-neutral-500 sm:text-base">
          Everything you need to know about extracting and managing YouTube
          transcripts.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div
              key={item.question}
              className={index !== faqItems.length - 1 ? "border-b border-neutral-200" : ""}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                className="flex w-full cursor-pointer items-center justify-between gap-6 px-5 py-5 text-left transition hover:bg-neutral-50 sm:px-6"
              >
                <span className="text-sm font-medium text-neutral-800 sm:text-base">
                  {item.question}
                </span>

                <span
                  aria-hidden="true"
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-neutral-500 transition-transform duration-200 ${
                    isOpen ? "rotate-45" : "rotate-0"
                  }`}
                >
                  <span className="text-lg leading-none">+</span>
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                className={`grid transition-[grid-template-rows,opacity] duration-200 ${
                  isOpen
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-6 text-neutral-500 sm:px-6">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
