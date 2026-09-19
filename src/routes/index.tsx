import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Bot } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatPanel } from "@/components/ChatPanel";
import { FaqExplorer } from "@/components/FaqExplorer";
import { NlpDemo } from "@/components/NlpDemo";

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
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="size-5" />
          </span>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">AI FAQ Chatbot</h1>
            <p className="text-xs text-muted-foreground">
              E-commerce support assistant · NLP preprocessing, TF-IDF & cosine similarity · runs
              fully offline
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-5">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="faqs">FAQ Explorer</TabsTrigger>
            <TabsTrigger value="about">About & NLP Demo</TabsTrigger>
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
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Built as an NLP demonstration project — no external APIs, no model calls, every score
        computed in the browser.
      </footer>
    </div>
  );
}
