import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Braces, Filter, GitCompareArrows, Hash, ScanText, Sigma } from "lucide-react";
import { CONFIDENCE_THRESHOLD, matchFaq, tfidfModel } from "@/lib/faqEngine";
import { faqData } from "@/data/faqData";

const PIPELINE = [
  {
    step: "1. Normalization",
    detail:
      "Lowercase the text, remove punctuation, digits and symbols, then collapse repeated whitespace.",
  },
  {
    step: "2. Tokenization",
    detail: "Split the cleaned string on word boundaries into individual tokens.",
  },
  {
    step: "3. Stopword removal",
    detail:
      "Drop ~190 high-frequency English function words (the, is, how, my …) that carry little meaning.",
  },
  {
    step: "4. Stemming",
    detail:
      "Porter-style suffix stripping folds variants together: resetting → reset, shipping → ship, refunds → refund.",
  },
  {
    step: "5. TF-IDF vectorization",
    detail:
      "tf(t,d) = count(t,d)/|d| and idf(t) = ln((1+N)/(1+df(t))) + 1. Each vector is L2-normalized.",
  },
  {
    step: "6. Cosine similarity",
    detail:
      "Because vectors are unit length, cos(q,d) = q · d. Every FAQ is scored 0–1 and ranked; the top score must clear the threshold.",
  },
];

const PIPELINE_ICONS = [ScanText, Hash, Filter, Braces, Sigma, GitCompareArrows];
const PIPELINE_STYLES = [
  "border-category-shipping/25 bg-category-shipping/10 text-category-shipping",
  "border-category-account/25 bg-category-account/10 text-category-account",
  "border-category-payments/25 bg-category-payments/10 text-category-payments",
  "border-category-product/25 bg-category-product/10 text-category-product",
  "border-category-support/25 bg-category-support/10 text-category-support",
  "border-category-returns/25 bg-category-returns/10 text-category-returns",
];

export function NlpDemo() {
  const [query, setQuery] = useState("How do I reset my forgotten password?");
  const [result, setResult] = useState(() => matchFaq("How do I reset my forgotten password?"));

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">A transparent path from question to answer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            This chatbot uses NLP preprocessing and similarity matching to identify the FAQ that is
            most relevant to a user's question. There is no language model and no network call: the{" "}
            {faqData.length}-entry FAQ corpus is vectorized in the browser at load time, and every
            confidence score you see is a real cosine similarity computed from those vectors.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE.map((p, index) => {
              const Icon = PIPELINE_ICONS[index];
              return (
              <div key={p.step} className="group rounded-lg border border-border bg-chat-surface p-4 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-md">
                <div className={cn("mb-3 flex size-9 items-center justify-center rounded-lg border", PIPELINE_STYLES[index])}>
                  <Icon className="size-4" aria-hidden="true" />
                </div>
                <p className="text-xs font-bold text-foreground">{p.step}</p>
                <p className="mt-1.5 text-xs leading-relaxed">{p.detail}</p>
              </div>
            );})}
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <Badge variant="secondary">{faqData.length} documents</Badge>
            <Badge variant="secondary">{tfidfModel.vocabulary.length} vocabulary terms</Badge>
            <Badge variant="secondary">
              threshold {(CONFIDENCE_THRESHOLD * 100).toFixed(0)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Live inspection tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setResult(matchFaq(query));
            }}
          >
             <Input
               aria-label="Query to inspect"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type any query to inspect its tokens and TF-IDF scores"
            />
             <Button type="submit" className="brand-gradient min-h-11 px-6 text-primary-foreground brand-glow">Analyse</Button>
          </form>

          <div className="grid gap-3 sm:grid-cols-2">
            <InspectBlock label="Normalized text" value={result.trace.normalized || "—"} />
            <InspectBlock label="Tokens" value={result.trace.tokens.join(" · ") || "—"} />
            <InspectBlock
              label="After stopword removal"
              value={result.trace.withoutStopwords.join(" · ") || "—"}
            />
            <InspectBlock label="Stems" value={result.trace.stems.join(" · ") || "—"} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-chat-surface">
            <table className="w-full text-left text-xs tabular-nums">
              <thead className="bg-muted/60 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 font-medium">Term (stem)</th>
                  <th className="px-3 py-2 font-medium">TF</th>
                  <th className="px-3 py-2 font-medium">IDF</th>
                  <th className="px-3 py-2 font-medium">TF-IDF</th>
                </tr>
              </thead>
              <tbody>
                {result.queryWeights.map((w) => (
                  <tr key={w.term} className="border-t">
                    <td className="px-3 py-1.5">{w.term}</td>
                    <td className="px-3 py-1.5">{w.tf.toFixed(4)}</td>
                    <td className="px-3 py-1.5">{w.idf.toFixed(4)}</td>
                    <td className="px-3 py-1.5">{w.tfidf.toFixed(4)}</td>
                  </tr>
                ))}
                {result.queryWeights.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-3 text-muted-foreground">
                      No meaningful terms left after preprocessing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold">Ranked cosine similarities</p>
            <ul className="space-y-1.5">
              {result.ranked.map((r) => (
                <li key={r.faq.id} className="flex items-center gap-3 text-xs">
                  <span className="w-12 shrink-0 tabular-nums font-medium">
                    {(r.score * 100).toFixed(1)}%
                  </span>
                  <span className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-muted">
                      <span
                       className="brand-gradient block h-full rounded-full"
                      style={{ width: `${Math.min(100, r.score * 100)}%` }}
                    />
                  </span>
                  <span className="text-muted-foreground">{r.faq.question}</span>
                </li>
              ))}
              {result.ranked.length === 0 && (
                <li className="text-xs text-muted-foreground">Nothing to rank for this query.</li>
              )}
            </ul>
          </div>

          <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Decision:</span>{" "}
            {result.status === "matched"
              ? `Top score clears the ${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}% threshold, so the matched answer is returned.`
              : `Top score is below the ${(CONFIDENCE_THRESHOLD * 100).toFixed(0)}% threshold, so the chatbot falls back to asking the user to rephrase.`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function InspectBlock({ label, value }: { label: string; value: string }) {
  const tokens = value === "—" ? [value] : value.split(" · ");
  return (
    <div className="rounded-lg border border-border bg-chat-surface p-4 shadow-sm">
      <p className="text-xs font-bold text-foreground">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {tokens.map((token, index) => <code key={`${token}-${index}`} className="rounded-md border border-primary/15 bg-primary/8 px-2 py-1 font-mono text-xs font-semibold text-primary">{token}</code>)}
      </div>
    </div>
  );
}
