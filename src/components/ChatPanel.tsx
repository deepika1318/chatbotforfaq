import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, CircleHelp, RotateCcw, SlidersHorizontal, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputFooter, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { cn } from "@/lib/utils";
import { CONFIDENCE_THRESHOLD, confidenceBand, matchFaq, type MatchResult } from "@/lib/faqEngine";
import assistantMark from "@/assets/faq-assistant-mark.png";

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
  const Icon = band === "high" ? CheckCircle2 : band === "moderate" ? AlertTriangle : CircleHelp;
  const label = band === "high" ? "High confidence" : band === "moderate" ? "Moderate match" : "Low match";
  return (
    <span
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${label}, ${(score * 100).toFixed(0)} percent`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold tabular-nums",
        band === "high" && "border-success/25 bg-success-soft text-success",
        band === "moderate" && "border-warning/25 bg-warning-soft text-warning",
        band === "low" && "border-destructive/25 bg-danger-soft text-destructive",
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {label} · {(score * 100).toFixed(0)}%
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
    <section aria-labelledby="chat-heading" className="flex h-[calc(100dvh-15.5rem)] min-h-[430px] flex-col overflow-hidden rounded-lg border border-border bg-chat-surface shadow-xl sm:h-[70vh] sm:min-h-[560px]">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card/90 px-3 py-3 sm:flex sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="brand-gradient brand-glow flex size-10 shrink-0 items-center justify-center rounded-lg">
            <img src={assistantMark} alt="" className="size-8 object-contain" width={512} height={512} />
          </span>
          <div className="min-w-0">
            <h3 id="chat-heading" className="truncate text-sm font-bold leading-tight">Orbit Support Assistant</h3>
            <p className="truncate text-xs font-medium text-muted-foreground">
              TF-IDF + cosine similarity · threshold {(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button aria-label={showDebug ? "Hide NLP details" : "Show NLP details"} aria-pressed={showDebug} variant="ghost" size="icon" className="min-h-11 min-w-11 sm:w-auto sm:px-3" onClick={() => setShowDebug((v) => !v)}>
            <SlidersHorizontal className="size-4" /> <span className="hidden sm:inline">{showDebug ? "Hide" : "Show"} logic</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 sm:w-auto sm:px-3"
            aria-label="Clear conversation"
            onClick={() => {
              setMessages([WELCOME]);
            }}
          >
            <RotateCcw className="size-4" /> <span className="hidden sm:inline">Clear</span>
          </Button>
        </div>
      </header>

      <Conversation aria-live="polite" aria-atomic="false" className="bg-chat-surface">
        <ConversationContent className="gap-5 px-3 py-5 sm:px-5">
        {messages.map((m) => (
          <div key={m.id} role="group" aria-label={m.role === "user" ? "Message from you" : "Message from Orbit Support Assistant"} className={cn("flex items-start gap-2.5", m.role === "user" && "flex-row-reverse")}>
            {m.role === "bot" && (
              <span className="brand-gradient mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg shadow-md ring-2 ring-primary/15">
                <img src={assistantMark} alt="" className="size-6 object-contain" width={512} height={512} />
              </span>
            )}
            <Message from={m.role === "bot" ? "assistant" : "user"} className="max-w-[88%] sm:max-w-[78%]">
              <MessageContent className={cn("leading-relaxed", m.role === "user" ? "brand-gradient rounded-br-sm px-4 py-3 text-primary-foreground shadow-lg" : "rounded-bl-sm border border-border bg-card px-4 py-3 shadow-sm")}>
                <MessageResponse>{m.text}</MessageResponse>
              </MessageContent>

              {m.result?.best && (
                <aside aria-label="FAQ match details" className="mt-2 space-y-2 rounded-lg border border-border bg-card px-3 py-3 shadow-sm">
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

                  {m.result.status !== "matched" && m.result.ranked.length > 1 && (
                    <div className="border-t border-border pt-2">
                      <p className="mb-2 text-xs font-bold text-foreground">Related topics</p>
                      <div className="flex flex-wrap gap-2">
                        {m.result.ranked.slice(1, 4).map((candidate) => (
                          <Button
                            key={candidate.faq.id}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-auto min-h-11 whitespace-normal rounded-md text-left text-xs"
                            onClick={() => send(candidate.faq.question)}
                          >
                            {candidate.faq.question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {showDebug && (
                     <Collapsible>
                       <CollapsibleTrigger className="min-h-11 rounded-md text-xs font-bold text-primary underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
                 </aside>
              )}
            </Message>
            {m.role === "user" && (
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary shadow-sm">
                <User className="size-4" aria-hidden="true" />
              </span>
            )}
          </div>
        ))}

        {isThinking && (
          <div role="status" aria-live="polite" aria-atomic="true" className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
            <span className="brand-gradient flex size-8 items-center justify-center rounded-lg shadow-sm">
              <img src={assistantMark} alt="" className="size-6 object-contain" width={512} height={512} />
            </span>
            <Shimmer>Analysing your question…</Shimmer>
          </div>
        )}
        </ConversationContent>
        <ConversationScrollButton aria-label="Scroll to latest message" />
      </Conversation>

      <footer className="sticky bottom-0 z-10 space-y-3 border-t border-border bg-card/95 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-xl sm:px-5">
        <PromptInput
          className="rounded-lg border-border bg-background shadow-md focus-within:ring-2 focus-within:ring-primary"
          onSubmit={({ text }) => send(text)}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your order, refund, account…"
            disabled={isThinking}
            aria-label="Message Orbit Support Assistant"
            className="min-h-12 text-sm"
          />
          <PromptInputFooter className="justify-end px-2 pb-2">
            <PromptInputSubmit className="brand-gradient min-h-11 min-w-11 rounded-md text-primary-foreground brand-glow" status={isThinking ? "submitted" : "ready"} disabled={isThinking || !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
        <nav aria-label="Example questions" className="scrollbar-none -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-0.5 sm:mx-0 sm:px-0">
          {EXAMPLE_QUESTIONS.map((q) => (
            <Button
              key={q}
              type="button"
              variant="outline"
              onClick={() => send(q)}
              className="min-h-11 shrink-0 snap-start rounded-full bg-background px-3 text-xs font-semibold text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-accent hover:text-accent-foreground hover:shadow-md"
            >
              {q}
            </Button>
          ))}
        </nav>
      </footer>
    </section>
  );
}
