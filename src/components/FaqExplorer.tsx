import { useMemo, useState } from "react";
import { MessageSquarePlus, Search } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { FAQ_CATEGORIES, faqData, type FaqCategory } from "@/data/faqData";

export function FaqExplorer({ onAskInChat }: { onAskInChat: (question: string) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<FaqCategory | "All">("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return faqData.filter((f) => {
      const inCategory = category === "All" || f.category === category;
      const inSearch =
        q.length === 0 ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return inCategory && inSearch;
    });
  }, [search, category]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all FAQs by keyword…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(["All", ...FAQ_CATEGORIES] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c as FaqCategory | "All")}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              category === c
                ? "border-primary bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {faqData.length} FAQs
      </p>

      <Accordion type="single" collapsible className="rounded-xl border bg-card px-4">
        {filtered.map((faq) => (
          <AccordionItem key={faq.id} value={String(faq.id)}>
            <AccordionTrigger className="text-left text-sm">
              <span className="flex flex-1 flex-wrap items-center gap-2 pr-2">
                {faq.question}
                <Badge variant="secondary" className="text-[10px] font-normal">
                  {faq.category}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              <Button size="sm" variant="outline" onClick={() => onAskInChat(faq.question)}>
                <MessageSquarePlus className="size-3.5" /> Ask this in chat
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filtered.length === 0 && (
        <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
          No FAQ matches that keyword. Try a different term or reset the category filter.
        </p>
      )}
    </div>
  );
}
