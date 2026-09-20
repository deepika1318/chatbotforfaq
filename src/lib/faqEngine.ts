/**
 * FAQ matching engine.
 * Wires the NLP pipeline (src/lib/nlp.ts) to the FAQ dataset and exposes a
 * single `matchFaq(query)` function used by the chat UI and the debug tools.
 */

import { faqData, type FaqEntry } from "@/data/faqData";
import {
  buildTfIdfModel,
  cosineSimilarity,
  preprocess,
  vectorizeQuery,
  type PreprocessTrace,
  type TfIdfModel,
  type Vector,
} from "@/lib/nlp";

/** Minimum cosine similarity required to trust a match. */
export const CONFIDENCE_THRESHOLD = 0.28;
/** Queries shorter than this (after stopword removal) are rejected outright. */
const MIN_MEANINGFUL_TOKENS = 1;

/**
 * The corpus is each FAQ question plus its category, which adds a little
 * topical signal ("refund", "shipping") without drowning out the question text.
 */
const corpus = faqData.map((f) => `${f.question} ${f.category}`);

/** The model is built once at module load — the dataset is static. */
export const tfidfModel: TfIdfModel = buildTfIdfModel(corpus);

export interface ScoredFaq {
  faq: FaqEntry;
  score: number;
}

export type MatchStatus = "matched" | "low_confidence" | "empty_query";

export interface MatchResult {
  status: MatchStatus;
  /** Best FAQ found, even when below threshold (null only for empty queries). */
  best: ScoredFaq | null;
  /** Top 5 ranked candidates, for the debug / inspection view. */
  ranked: ScoredFaq[];
  /** Every preprocessing step applied to the query. */
  trace: PreprocessTrace;
  /** The query's TF-IDF weights, sorted descending, for the demo view. */
  queryWeights: Array<{ term: string; tf: number; idf: number; tfidf: number }>;
  /** The answer (or fallback) text to show in the chat. */
  reply: string;
}

export const FALLBACK_MESSAGE =
  "I don't have an exact match, but here is the most relevant information from our support knowledge base:";

const generalSupportFaq = faqData.find((faq) => faq.category === "Customer Support") ?? faqData[0];

/** Run a query through the full pipeline and rank every FAQ by cosine similarity. */
export function matchFaq(query: string): MatchResult {
  const trace = preprocess(query);

  // --- Guard: empty or meaningless query ---------------------------------
  if (trace.stems.length < MIN_MEANINGFUL_TOKENS) {
    const related = faqData
      .filter((faq) => faq.category === "Customer Support")
      .slice(0, 3)
      .map((faq) => ({ faq, score: 0 }));
    return {
      status: "empty_query",
      best: generalSupportFaq ? { faq: generalSupportFaq, score: 0 } : null,
      ranked: related,
      trace,
      queryWeights: [],
      reply: generalSupportFaq
        ? `${FALLBACK_MESSAGE} ${generalSupportFaq.answer} You can also use Orders → Track shipment for order updates, or choose a related topic below.`
        : "Please ask about an order, delivery, return, account, payment, product, or customer support topic.",
    };
  }

  // --- Vectorize and score -------------------------------------------------
  const queryVector: Vector = vectorizeQuery(tfidfModel, trace.stems);
  const ranked: ScoredFaq[] = faqData
    .map((faq, index) => ({
      faq,
      score: cosineSimilarity(queryVector, tfidfModel.documentVectors[index] ?? new Map()),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  if (!best) {
    return {
      status: "empty_query",
      best: null,
      ranked: [],
      trace,
      queryWeights: [],
      reply: "Please ask about an order, delivery, return, account, payment, product, or customer support topic.",
    };
  }

  // --- Weight breakdown for the NLP demo view ------------------------------
  const counts = new Map<string, number>();
  for (const s of trace.stems) counts.set(s, (counts.get(s) ?? 0) + 1);
  const unknownIdf = Math.log((1 + tfidfModel.documentCount) / 1) + 1;
  const queryWeights = Array.from(counts.entries())
    .map(([term, count]) => {
      const tf = count / trace.stems.length;
      const idf = tfidfModel.idf.get(term) ?? unknownIdf;
      return { term, tf, idf, tfidf: tf * idf };
    })
    .sort((a, b) => b.tfidf - a.tfidf);

  if (best.score >= CONFIDENCE_THRESHOLD) {
    return {
      status: "matched",
      best,
      ranked: ranked.slice(0, 5),
      trace,
      queryWeights,
      reply: best.faq.answer,
    };
  }

  return {
    status: "low_confidence",
    best,
    ranked: ranked.slice(0, 5),
    trace,
    queryWeights,
    reply: `${FALLBACK_MESSAGE} ${best.faq.answer} If this does not resolve your issue, use live chat in the app, email support@shopdesk.example, or call 1800-123-456 between 9 AM and 9 PM. You can also choose a related topic below.`,
  };
}

/** Colour band for a confidence chip. */
export function confidenceBand(score: number): "high" | "moderate" | "low" {
  if (score >= 0.6) return "high";
  if (score >= 0.3) return "moderate";
  return "low";
}
