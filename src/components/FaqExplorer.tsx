import { useMemo, useState } from "react";
import { CircleDollarSign, Headphones, KeyRound, MessageSquarePlus, PackageSearch, RotateCcw, Search, Undo2 } from "lucide-react";

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

const CATEGORY_STYLES: Record<FaqCategory, string> = {
  "Orders & Shipping": "border-category-shipping/25 bg-category-shipping/10 text-category-shipping",
  "Returns & Refunds": "border-category-returns/25 bg-category-returns/10 text-category-returns",
  "Account & Security": "border-category-account/25 bg-category-account/10 text-category-account",
  "Payments & Invoices": "border-category-payments/25 bg-category-payments/10 text-category-payments",
  "Product & Stock": "border-category-product/25 bg-category-product/10 text-category-product",
  "Customer Support": "border-category-support/25 bg-category-support/10 text-category-support",
};

const CATEGORY_ICONS: Record<FaqCategory, typeof PackageSearch> = {
  "Orders & Shipping": PackageSearch,
  "Returns & Refunds": Undo2,
  "Account & Security": KeyRound,
  "Payments & Invoices": CircleDollarSign,
  "Product & Stock": PackageSearch,
  "Customer Support": Headphones,
};

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
    <div className="space-y-5">
      <div className="relative rounded-lg border border-border bg-card p-2 shadow-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search all FAQs by keyword…"
          aria-label="Search frequently asked questions"
          className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-2"
        />
      </div>

      <div className="scrollbar-none -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {(["All", ...FAQ_CATEGORIES] as const).map((c) => (
          <Button
            key={c}
            type="button"
            variant="outline"
            onClick={() => setCategory(c as FaqCategory | "All")}
            aria-pressed={category === c}
            className={cn(
              "min-h-11 shrink-0 snap-start rounded-full px-4 text-xs font-bold shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
              category === c
                ? "brand-gradient border-transparent text-primary-foreground brand-glow"
                : c === "All" ? "bg-card text-foreground" : CATEGORY_STYLES[c],
            )}
          >
            {c}
          </Button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} of {faqData.length} FAQs
      </p>

      <Accordion type="single" collapsible className="grid gap-3 sm:grid-cols-2">
        {filtered.map((faq) => (
          <AccordionItem key={faq.id} value={String(faq.id)} className="self-start rounded-lg border border-border bg-card px-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md">
            <AccordionTrigger className="min-h-14 text-left text-sm font-semibold focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <span className="flex min-w-0 flex-1 flex-col items-start gap-2 pr-2">
                <span>{faq.question}</span>
                <Badge variant="outline" className={cn("gap-1.5 text-[10px] font-bold", CATEGORY_STYLES[faq.category])}>
                  {(() => { const Icon = CATEGORY_ICONS[faq.category]; return <Icon className="size-3" aria-hidden="true" />; })()}
                  {faq.category}
                </Badge>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3">
              <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
              <Button className="min-h-11" size="sm" variant="outline" onClick={() => onAskInChat(faq.question)}>
                <MessageSquarePlus className="size-3.5" /> Ask this in chat
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
          <p className="text-sm font-semibold text-foreground">No matching answers found</p>
          <Button variant="ghost" className="mt-2 min-h-11" onClick={() => { setSearch(""); setCategory("All"); }}><RotateCcw className="size-4" /> Reset filters</Button>
        </div>
      )}
    </div>
  );
}
