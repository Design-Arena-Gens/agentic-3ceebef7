'use client';

import { FormEvent, useMemo, useState } from "react";

type ReplyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string; translation: string }
  | { status: "error"; message: string };

export default function Home() {
  const [question, setQuestion] = useState("");
  const [reply, setReply] = useState<ReplyState>({ status: "idle" });
  const canSubmit = useMemo(
    () => question.trim().length > 0 && reply.status !== "loading",
    [question, reply.status],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) {
      return;
    }

    setReply({ status: "loading" });

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = (await response.json()) as {
        translation: string;
        reply: string;
      };

      setReply({
        status: "success",
        message: data.reply,
        translation: data.translation,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setReply({
        status: "error",
        message:
          "I’m sorry, I ran into a small issue while responding. Please try again shortly.",
      });
      console.error("[translate:error]", message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 text-slate-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-10 px-6 py-16 sm:px-10">
        <header className="space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
            Gentle English Replies
          </h1>
          <p className="text-lg text-slate-600">
            Share any question, even if it is in Marathi. I will answer in
            English with a simple and polite tone.
          </p>
        </header>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              Your question
            </label>
            <textarea
              className="h-36 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
              placeholder="तुमचा प्रश्न येथे लिहा…"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={1000}
              aria-label="Question input"
            />
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Responses stay polite and easy to read.
              </span>
              <button
                type="submit"
                disabled={!canSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {reply.status === "loading" ? "Translating…" : "Answer in English"}
              </button>
            </div>
          </form>
        </section>

        <section className="min-h-[140px] rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/40">
          {reply.status === "idle" && (
            <p className="text-base text-slate-500">
              Your English reply will appear here.
            </p>
          )}
          {reply.status === "loading" && (
            <p className="animate-pulse text-base text-slate-600">
              Crafting a gentle reply…
            </p>
          )}
          {reply.status === "error" && (
            <p className="text-base text-rose-500">{reply.message}</p>
          )}
          {reply.status === "success" && (
            <div className="space-y-3">
              <p className="text-base leading-relaxed text-slate-800">
                {reply.message}
              </p>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                <p className="font-medium text-slate-600">Translated question</p>
                <p>{reply.translation}</p>
              </div>
            </div>
          )}
        </section>

        <footer className="pb-6 text-sm text-slate-500">
          Built to keep conversations friendly and clear.
        </footer>
      </main>
    </div>
  );
}
