/**
 * ============================================================================
 *  A small, dependency-free NLP engine: preprocessing + TF-IDF + cosine match
 * ============================================================================
 *
 *  Pipeline
 *  --------
 *   raw text
 *     -> normalize      (lowercase, strip punctuation/digits, collapse spaces)
 *     -> tokenize       (split on whitespace / word boundaries)
 *     -> stopword filter(remove high-frequency, low-information words)
 *     -> stem           (suffix-stripping, Porter-style light stemmer)
 *     -> TF-IDF vector  (term frequency x inverse document frequency, L2-normed)
 *     -> cosine similarity against every FAQ question vector
 *
 *  All scores produced here are genuinely computed from the dataset; nothing
 *  is mocked or randomised.
 */

/* -------------------------------------------------------------------------- */
/* 1. Stopwords                                                               */
/* -------------------------------------------------------------------------- */

/** Comprehensive English stopword list (function words carry little meaning). */
export const STOPWORDS = new Set<string>([
  "a","about","above","after","again","against","all","am","an","and","any","are",
  "aren't","as","at","be","because","been","before","being","below","between",
  "both","but","by","can","cannot","could","couldn't","did","didn't","do","does",
  "doesn't","doing","don't","down","during","each","few","for","from","further",
  "had","hadn't","has","hasn't","have","haven't","having","he","he'd","he'll",
  "he's","her","here","here's","hers","herself","him","himself","his","how",
  "how's","i","i'd","i'll","i'm","i've","if","in","into","is","isn't","it","it's",
  "its","itself","let's","me","more","most","mustn't","my","myself","no","nor",
  "not","of","off","on","once","only","or","other","ought","our","ours",
  "ourselves","out","over","own","please","same","shan't","she","she'd","she'll",
  "she's","should","shouldn't","so","some","such","than","that","that's","the",
  "their","theirs","them","themselves","then","there","there's","these","they",
  "they'd","they'll","they're","they've","this","those","through","to","too",
  "under","until","up","very","was","wasn't","we","we'd","we'll","we're","we've",
  "were","weren't","what","what's","when","when's","where","where's","which",
  "while","who","who's","whom","why","why's","will","with","won't","would",
  "wouldn't","you","you'd","you'll","you're","you've","your","yours","yourself",
  "yourselves","just","also","get","got","getting","want","need","tell","know",
  "kindly","hi","hello","hey","thanks","thank",
]);

/* -------------------------------------------------------------------------- */
/* 2. Normalization & tokenization                                            */
/* -------------------------------------------------------------------------- */

/**
 * Lowercase the text, drop digits and every character that is not a letter or
 * an apostrophe, then collapse repeated whitespace.
 */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/['’]/g, "") // don't -> dont (so the stopword list still matches)
    .replace(/[^a-z\s]/g, " ") // punctuation, digits, symbols -> space
    .replace(/\s+/g, " ")
    .trim();
}

/** Split normalized text on word boundaries. */
export function tokenize(text: string): string[] {
  const clean = normalize(text);
  return clean.length === 0 ? [] : clean.split(" ");
}

/** Remove stopwords and 1-character tokens. */
export function removeStopwords(tokens: string[]): string[] {
  return tokens.filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/* -------------------------------------------------------------------------- */
/* 3. Stemming                                                                */
/* -------------------------------------------------------------------------- */

/** Does the word contain a vowel? Used to avoid over-stripping short stems. */
function hasVowel(word: string): boolean {
  return /[aeiouy]/.test(word);
}

/**
 * Light Porter-style suffix-stripping stemmer.
 * Aligns morphological variants, e.g.
 *   resetting -> reset, changing -> chang, shipping -> ship,
 *   refunds -> refund, cancellation -> cancel, deliveries -> deliveri
 */
export function stem(wordInput: string): string {
  let word = wordInput;
  if (word.length <= 3) return word;

  // --- Step 1a: plurals -----------------------------------------------------
  if (word.endsWith("ies") && word.length > 4) word = word.slice(0, -3) + "i";
  else if (word.endsWith("sses")) word = word.slice(0, -2);
  else if (word.endsWith("ss")) {
    /* keep as-is: address, class */
  } else if (word.endsWith("s")) word = word.slice(0, -1);

  // --- Step 1b: past tense / progressive ------------------------------------
  if (word.endsWith("eed") && word.length > 4) {
    word = word.slice(0, -1); // agreed -> agree
  } else if (word.endsWith("ed") && hasVowel(word.slice(0, -2))) {
    word = word.slice(0, -2);
    word = restoreStem(word);
  } else if (word.endsWith("ing") && hasVowel(word.slice(0, -3))) {
    word = word.slice(0, -3);
    word = restoreStem(word);
  }

  // --- Step 2/3: common derivational suffixes -------------------------------
  const suffixes: Array<[string, string]> = [
    ["ational", "ate"],
    ["fulness", "ful"],
    ["ousness", "ous"],
    ["iveness", "ive"],
    ["ization", "ize"],
    ["ableness", "able"],
    ["ation", ""],
    ["ement", ""],
    ["ments", ""],
    ["ment", ""],
    ["ness", ""],
    ["ities", "ity"],
    ["ity", ""],
    ["ally", "al"],
    ["fully", "ful"],
    ["ely", "e"],
    ["ly", ""],
    ["ance", ""],
    ["ence", ""],
    ["able", ""],
    ["ible", ""],
    ["ical", "ic"],
    ["ful", ""],
    ["ise", ""],
    ["ize", ""],
    ["er", ""],
    ["or", ""],
  ];
  for (const [suffix, replacement] of suffixes) {
    if (word.endsWith(suffix) && word.length - suffix.length >= 3) {
      word = word.slice(0, -suffix.length) + replacement;
      break;
    }
  }

  // --- Step 5: tidy trailing "e" and doubled consonants ---------------------
  if (word.length > 4 && word.endsWith("e")) word = word.slice(0, -1);
  if (word.length > 4 && /([^aeiou])\1$/.test(word)) word = word.slice(0, -1);

  return word;
}

/** Fix up a stem after removing -ed / -ing (hopp -> hop, us -> use). */
function restoreStem(word: string): string {
  if (/([^aeiouls])\1$/.test(word)) return word.slice(0, -1); // shipp -> ship
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(word) && word.length <= 3) return word + "e";
  return word;
}

/* -------------------------------------------------------------------------- */
/* 4. Full preprocessing pipeline                                             */
/* -------------------------------------------------------------------------- */

export interface PreprocessTrace {
  raw: string;
  normalized: string;
  tokens: string[];
  withoutStopwords: string[];
  stems: string[];
}

/** Run the whole pipeline and keep every intermediate step for the demo UI. */
export function preprocess(text: string): PreprocessTrace {
  const normalized = normalize(text);
  const tokens = tokenize(text);
  const withoutStopwords = removeStopwords(tokens);
  const stems = withoutStopwords.map(stem);
  return { raw: text, normalized, tokens, withoutStopwords, stems };
}

/* -------------------------------------------------------------------------- */
/* 5. TF-IDF vectorizer                                                       */
/* -------------------------------------------------------------------------- */

/** A sparse vector: term -> weight. */
export type Vector = Map<string, number>;

export interface TfIdfModel {
  /** Every term seen in the corpus. */
  vocabulary: string[];
  /** term -> document frequency (how many docs contain the term). */
  documentFrequency: Map<string, number>;
  /** term -> smoothed IDF weight. */
  idf: Map<string, number>;
  /** Number of documents in the corpus. */
  documentCount: number;
  /** L2-normalized TF-IDF vector per document, aligned with the input order. */
  documentVectors: Vector[];
  /** Stem list per document (useful for the debug view). */
  documentStems: string[][];
}

/** Term frequency: raw count of each term divided by document length. */
export function termFrequency(stems: string[]): Vector {
  const counts: Vector = new Map();
  for (const s of stems) counts.set(s, (counts.get(s) ?? 0) + 1);
  const total = stems.length || 1;
  const tf: Vector = new Map();
  counts.forEach((count, term) => tf.set(term, count / total));
  return tf;
}

/** L2 normalization so cosine similarity reduces to a plain dot product. */
export function l2Normalize(vector: Vector): Vector {
  let sumSquares = 0;
  vector.forEach((v) => (sumSquares += v * v));
  const norm = Math.sqrt(sumSquares);
  if (norm === 0) return new Map();
  const out: Vector = new Map();
  vector.forEach((v, k) => out.set(k, v / norm));
  return out;
}

/**
 * Build the TF-IDF model from the corpus of FAQ documents.
 * IDF uses the standard smoothed formula:  idf(t) = ln((1 + N) / (1 + df(t))) + 1
 */
export function buildTfIdfModel(documents: string[]): TfIdfModel {
  const documentStems = documents.map((d) => preprocess(d).stems);
  const documentCount = documentStems.length;

  // Document frequency: in how many documents does each term appear?
  const documentFrequency = new Map<string, number>();
  for (const stems of documentStems) {
    for (const term of new Set(stems)) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  // Inverse document frequency (smoothed).
  const idf = new Map<string, number>();
  documentFrequency.forEach((df, term) => {
    idf.set(term, Math.log((1 + documentCount) / (1 + df)) + 1);
  });

  // TF-IDF vectors, L2 normalized.
  const documentVectors = documentStems.map((stems) => {
    const tf = termFrequency(stems);
    const vector: Vector = new Map();
    tf.forEach((tfValue, term) => vector.set(term, tfValue * (idf.get(term) ?? 0)));
    return l2Normalize(vector);
  });

  return {
    vocabulary: Array.from(documentFrequency.keys()).sort(),
    documentFrequency,
    idf,
    documentCount,
    documentVectors,
    documentStems,
  };
}

/**
 * Vectorize an arbitrary query with the corpus IDF weights.
 * Unknown terms (not in the vocabulary) get the maximum IDF value, which is the
 * usual smoothing choice: a term never seen before is maximally informative but
 * matches nothing, so it simply dilutes the similarity.
 */
export function vectorizeQuery(model: TfIdfModel, stems: string[]): Vector {
  const tf = termFrequency(stems);
  const unknownIdf = Math.log((1 + model.documentCount) / 1) + 1;
  const vector: Vector = new Map();
  tf.forEach((tfValue, term) => {
    const idf = model.idf.get(term) ?? unknownIdf;
    vector.set(term, tfValue * idf);
  });
  return l2Normalize(vector);
}

/* -------------------------------------------------------------------------- */
/* 6. Cosine similarity                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Cosine similarity of two L2-normalized sparse vectors.
 * cos(a, b) = (a · b) / (||a|| ||b||); with unit vectors this is just a · b.
 * Result lies in [0, 1] because all TF-IDF weights are non-negative.
 */
export function cosineSimilarity(a: Vector, b: Vector): number {
  // Iterate over the smaller vector for speed.
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  small.forEach((value, term) => {
    const other = large.get(term);
    if (other !== undefined) dot += value * other;
  });
  return dot;
}
