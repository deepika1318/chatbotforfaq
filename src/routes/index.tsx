import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Braces, Database, MessageCircleMore } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "@/components/ChatPanel";
import { FaqExplorer } from "@/components/FaqExplorer";
import { NlpDemo } from "@/components/NlpDemo";
import assistantMark from "@/assets/faq-assistant-mark.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI FAQ Chatbot — TF-IDF & Cosine Similarity Support Assistant" },
      {
        name: "description",
        content:
          "An offline e-commerce FAQ chatbot that matches questions with real NLP preprocessing, TF-IDF vectorization and cosine similarity scoring.",
      },
      { property: "og:title", content: "AI FAQ Chatbot — NLP Support Assistant" },
      {
        property: "og:description",
        content:
          "Ask shopping support questions and see the exact tokens, TF-IDF weights and confidence scores behind every matched FAQ.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [tab, setTab] = useState("chat");

  return (
    <div className="min-h-dvh bg-background soft-grid">
      <header className="border-b border-border/80 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-4 sm:flex sm:justify-between sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <span className="brand-gradient brand-glow flex size-11 shrink-0 items-center justify-center rounded-xl">
              <img src={assistantMark} alt="" className="size-9 object-contain" width={512} height={512} />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">Orbit FAQ</h1>
              <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
                Intelligent answers, transparent matching
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm sm:flex">
            <span className="size-2 rounded-full bg-success" aria-hidden="true" />
            Private & offline
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mb-5 max-w-2xl">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">Support intelligence studio</p>
          <h2 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">Answers you can trust. Logic you can inspect.</h2>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Application sections" className="mb-5 grid h-auto w-full grid-cols-3 gap-1 rounded-lg border border-border bg-card p-1 shadow-sm sm:w-fit">
            <TabsTrigger value="chat" className="min-h-10 gap-1.5 px-2 text-xs sm:px-4 sm:text-sm"><MessageCircleMore className="size-4 shrink-0" /> Chat</TabsTrigger>
            <TabsTrigger value="faqs" className="min-h-10 gap-1.5 px-2 text-xs sm:px-4 sm:text-sm"><Database className="size-4 shrink-0" /> <span className="hidden xs:inline">FAQ </span>Library</TabsTrigger>
            <TabsTrigger value="about" className="min-h-10 gap-1.5 px-2 text-xs sm:px-4 sm:text-sm"><Braces className="size-4 shrink-0" /> NLP Lab</TabsTrigger>
          </TabsList>

          <TabsContent value="chat">
            <ChatPanel
              pendingQuestion={pendingQuestion}
              onPendingConsumed={() => setPendingQuestion(null)}
            />
          </TabsContent>

          <TabsContent value="faqs">
            <FaqExplorer
              onAskInChat={(question) => {
                setPendingQuestion(question);
                setTab("chat");
              }}
            />
          </TabsContent>

          <TabsContent value="about">
            <NlpDemo />
          </TabsContent>
        </Tabs>
      </div>

      <footer className="border-t border-border/80 bg-background/80 px-4 py-6 text-center text-xs font-medium text-muted-foreground">
        Private by design · Every score is computed instantly in your browser
      </footer>
    </div>
  );
}
