import { useEffect, useRef, useState } from "react";
import { Bot, RotateCcw, Send, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { CONFIDENCE_THRESHOLD, confidenceBand, matchFaq, type MatchResult } from "@/lib/faqEngine";

export interface ChatMessage {
  id: string;
  role: "user" | "bot";
  text: string;
  result?: MatchResult;
}

const EXAMPLE_QUESTIONS = [
  "I forgot my password, how do I change it?",
  "Where is my package?",
  "Can I get a refund?",
  "How do I cancel my order?",
  "Which payment methods can I use?",
];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "bot",
  text:
    "Hi! I'm a fully offline FAQ assistant for an online store. Ask me about orders & shipping, returns & refunds, account & security, payments & invoices, products & stock, or contacting support. I compare your question with 37 FAQs using TF-IDF and cosine similarity, and show you the confidence of each match.",
};

function ConfidenceChip({ score }: { score: number }) {
  const band = confidenceBand(score);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
        band === "high" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
        band === "moderate" && "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
        band === "low" && "bg-destructive/10 text-destructive",
      )}
    >
      {(score * 100).toFixed(0)}% match
    </span>
  );
}

export function ChatPanel({
  pendingQuestion,
  onPendingConsumed,
}: {
  pendingQuestion?: string | null;
  onPendingConsumed?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isThinking]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function send(text: string) {
    const question = text.trim();
    if (!question || isThinking) return;

    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", text: question },
    ]);
    setInput("");
    setIsThinking(true);

    // Small delay purely so the typing state is perceivable; matching is instant.
    window.setTimeout(() => {
      const result = matchFaq(question);
      setMessages((prev) => [
        ...prev,
        { id: `b-${Date.now()}`, role: "bot", text: result.reply, result },
      ]);
      setIsThinking(false);
      inputRef.current?.focus();
    }, 320);
  }

  // Allow the FAQ explorer to push a question straight into the chat.
  useEffect(() => {
    if (pendingQuestion) {
      send(pendingQuestion);
      onPendingConsumed?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingQuestion]);

  return (
    <div className="flex h-[70vh] min-h-[520px] flex-col overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bot className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-tight">Support Assistant</p>
            <p className="text-xs text-muted-foreground">
              TF-IDF + cosine similarity · threshold {(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowDebug((v) => !v)}>
            {showDebug ? "Hide" : "Show"} debug
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setMessages([WELCOME]);
              inputRef.current?.focus();
            }}
          >
            <RotateCcw className="size-3.5" /> Clear
          </Button>
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn("flex gap-2", m.role === "user" ? "justify-end" : "justify-start")}
          >
            {m.role === "bot" && (
              <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Bot className="size-3.5" />
              </span>
            )}
            <div className={cn("max-w-[85%] space-y-2 sm:max-w-[75%]")}>
              <div
                className={cn(
                  "rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-sm bg-primary text-primary-foreground"
                    : "rounded-bl-sm bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>

              {m.result?.best && (
                <div className="space-y-2 rounded-lg border bg-background px-3 py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <ConfidenceChip score={m.result.best.score} />
                    <Badge variant="secondary" className="text-xs">
                      {m.result.best.faq.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Matched FAQ:</span>{" "}
                    {m.result.best.faq.question}
                  </p>

                  {showDebug && (
                    <Collapsible>
                      <CollapsibleTrigger className="text-xs font-medium text-primary underline-offset-2 hover:underline">
                        Inspect NLP steps
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2 text-xs">
                        <p>
                          <span className="font-medium">Tokens:</span>{" "}
                          {m.result.trace.tokens.join(", ") || "—"}
                        </p>
                        <p>
                          <span className="font-medium">After stopwords:</span>{" "}
                          {m.result.trace.withoutStopwords.join(", ") || "—"}
                        </p>
                        <p>
                          <span className="font-medium">Stems:</span>{" "}
                          {m.result.trace.stems.join(", ") || "—"}
                        </p>
                        <div>
                          <p className="font-medium">Top TF-IDF weights</p>
                          <ul className="mt-1 space-y-0.5 tabular-nums text-muted-foreground">
                            {m.result.queryWeights.slice(0, 5).map((w) => (
                              <li key={w.term}>
                                {w.term}: tf {w.tf.toFixed(3)} × idf {w.idf.toFixed(3)} ={" "}
                                {w.tfidf.toFixed(4)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <p className="font-medium">Top candidates</p>
                          <ul className="mt-1 space-y-0.5 tabular-nums text-muted-foreground">
                            {m.result.ranked.map((r) => (
                              <li key={r.faq.id}>
                                {(r.score * 100).toFixed(1)}% — {r.faq.question}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </div>
              )}
            </div>
            {m.role === "user" && (
              <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-3.5" />
              </span>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-7 items-center justify-center rounded-full bg-muted">
              <Bot className="size-3.5" />
            </span>
            Analysing your question…
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="space-y-3 border-t px-4 py-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your order, refund, account…"
            disabled={isThinking}
          />
          <Button type="submit" size="icon" disabled={isThinking || !input.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
