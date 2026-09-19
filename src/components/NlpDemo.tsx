import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export function NlpDemo() {
  const [query, setQuery] = useState("How do I reset my forgotten password?");
  const [result, setResult] = useState(() => matchFaq("How do I reset my forgotten password?"));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How this chatbot works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            This chatbot uses NLP preprocessing and similarity matching to identify the FAQ that is
            most relevant to a user's question. There is no language model and no network call: the{" "}
            {faqData.length}-entry FAQ corpus is vectorized in the browser at load time, and every
            confidence score you see is a real cosine similarity computed from those vectors.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PIPELINE.map((p) => (
              <div key={p.step} className="rounded-lg border bg-muted/40 p-3">
                <p className="text-xs font-semibold text-foreground">{p.step}</p>
                <p className="mt-1 text-xs">{p.detail}</p>
              </div>
            ))}
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

      <Card>
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
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type any query to inspect its tokens and TF-IDF scores"
            />
            <Button type="submit">Analyse</Button>
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

          <div className="overflow-x-auto rounded-lg border">
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
                      className="block h-full rounded-full bg-primary"
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
  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <p className="text-xs font-semibold">{label}</p>
      <p className="mt-1 break-words font-mono text-xs text-muted-foreground">{value}</p>
    </div>
  );
}
