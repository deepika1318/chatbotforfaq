# Smart Answer Bot

Implement the requested AI FAQ Chatbot now; use internal planning and do not present another implementation plan for user approval.

Project title: AI FAQ Chatbot

Core specifications and requirements:

1. FAQ DATASET
- Sample FAQ dataset for an online shopping / e-commerce product support service.
- At least 30 realistic, practical FAQ question-answer pairs categorized across domains (e.g., Orders & Shipping, Returns & Refunds, Account & Security, Payments & Invoices, Product & Stock, Customer Support).
- Each entry: `id`, `question`, `answer`, `category`.
- Structured cleanly in a dedicated data file (e.g. `faqData.ts`) so it can be easily updated or extended.

2. REAL NLP PREPROCESSING & MATCHING ENGINE (No mock or fake scores)
- Clean, commented NLP pipeline in TypeScript/JavaScript:
  - Text normalization: lowercase, strip punctuation, digits/special characters handling.
  - Tokenization: word boundary splitting.
  - Stopword removal: comprehensive list of English stopwords filtered out.
  - Word stemming or basic lemmatization (e.g., Porter stemmer or suffix stripping rules) so variations like "resetting" / "reset", "change" / "changing", "shipping" / "ship" align.
- TF-IDF Vectorizer:
  - Compute vocabulary and Inverse Document Frequency (IDF) over the preprocessed FAQ questions dataset: `IDF(t) = log((1 + N) / (1 + df(t))) + 1` (or standard smoothed formula).
  - Compute Term Frequency (TF) for documents and incoming query.
  - Vector representation with L2 normalization.
- Cosine Similarity:
  - Calculate dot product of normalized TF-IDF vectors for the query against every FAQ question.
  - Rank by similarity score (0.0 to 1.0 / 0% to 100%).
  - Configurable threshold (e.g., 0.25 - 0.30):
    - If top similarity score is >= threshold: return the matched FAQ's answer, show the matched FAQ question, and display the exact calculated similarity/confidence score (e.g. "82% match").
    - If top similarity score < threshold or query is unrecognized/empty/too short: respond with fallback: "I'm not confident I found the right answer. Please try rephrasing your question or contact support." Display the closest score if relevant or explain why.

3. CHATBOT UI
- Clean, modern, responsive chat layout:
  - Welcome message explaining capabilities and what topics can be asked.
  - Chat thread: user messages right-aligned, bot messages left-aligned.
  - Bot responses showing: answer text, small collapsible or badge showing "Matched FAQ: [Original Question]" and a Confidence Score chip (color-coded: green for high confidence >= 0.6, amber for moderate >= 0.3).
  - Text input box with send button, Enter key support, and loading state indicator.
  - Clear conversation / restart chat button.
  - Clickable example question chips below the input box (e.g., "I forgot my password, how do I change it?", "Where is my package?", "Can I get a refund?", "How do I cancel my order?").

4. FAQ EXPLORER
- Tab or drawer/section to browse all 30+ FAQs.
- Live keyword search bar.
- Category filter buttons/chips.
- Accordion or card layout showing questions, categories, and answers.
- "Ask this in chat" shortcut button on any FAQ to test matching directly.

5. "ABOUT THIS PROJECT" / NLP DEMO SECTION
- Dedicated section or tab explaining the inner workings for an academic / internship demo:
  - Overview: "This chatbot uses NLP preprocessing and similarity matching to identify the FAQ that is most relevant to a user's question."
  - Step-by-step pipeline visualization/cards: Tokenization -> Stopword Removal -> Stemming -> TF-IDF Vectorization -> Cosine Similarity.
  - Live inspection tool or debug toggle: ability to see the processed tokens and calculated TF-IDF scores for any query to inspect how the algorithm made its match.

6. DESIGN & CODE QUALITY
- Minimalist, professional aesthetic suitable for an internship project portfolio.
- Well-commented codebase explaining the NLP math and algorithm clearly.
- Fully functional without external API dependencies so it works reliably offline and instantly.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://chatbotforfaq.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0725b6d9-5970-4990-992e-9a8e47f4e461).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
