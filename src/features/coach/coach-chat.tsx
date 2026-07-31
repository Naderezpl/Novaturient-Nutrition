"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  Dumbbell,
  Leaf,
  Milk,
  Send,
  Sparkles,
  Wheat,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { categoryLabels, currentClient } from "@/lib/demo-data";
import {
  buildEstimate,
  buildExplainLastMeal,
  buildTeaching,
  buildTonightIdeas,
  detectIntent,
  getSubstitutions,
  makeStaticRemaining,
} from "@/features/coach/substitution-engine";
import { EXCHANGE_GROUP_ORDER, FOOD_GROUPS_REFERENCE } from "@/features/coach/food-groups-reference";
import { exchangeOrder, getRemainingExchanges } from "@/lib/exchanges";
import type { ExchangeCategory } from "@/types/app";
import type { ReferenceFood } from "@/features/coach/food-groups-reference";

const CATEGORY_ICON: Record<ExchangeCategory, LucideIcon> = {
  starch: Wheat,
  fruit: Sparkles,
  vegetable: Leaf,
  protein: Dumbbell,
  dairy: Milk,
  fat: Sparkles,
};

type Message = {
  id: string;
  role: "coach" | "user";
  title?: string;
  content: string[];
  citation?: string;
  alternatives?: { category: ExchangeCategory; items: ReferenceFood[]; note?: string }[];
  questions?: string[];
  stamp: string;
};

function todayShortStamp() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const SUGGESTION_CHIPS = [
  {
    title: "Substitute a protein",
    prompt: "I want another protein than fish",
    icon: Dumbbell,
  },
  {
    title: "What can I eat tonight?",
    prompt: "What can I eat tonight",
    icon: BookOpen,
  },
  {
    title: "Estimate exchanges",
    prompt: "I had chicken, rice, olive oil and salad",
    icon: Sparkles,
  },
  {
    title: "Explain my last meal",
    prompt: "Explain my last meal",
    icon: BrainCircuit,
  },
];

export function CoachChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "welcome",
      role: "coach",
      title: "Hello, I'm your AI exchange coach",
      content: [
        "I teach with the same food group categories shown on the Food Groups page.",
        "If you ask for alternatives — like \"another protein than fish\" — I'll give you several one-exchange picks, each one citing the Protein category and smaller group, and I'll never shame you for your choices.",
      ],
      citation: "Answers reference the Food Groups categories and food-group rows.",
      stamp: todayShortStamp(),
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  const remaining = useMemo(() => {
    const r = getRemainingExchanges(currentClient.plan, currentClient.recentMeals);
    return exchangeOrder.reduce((acc, c) => {
      acc[c] = Math.round(r[c] * 2) / 2;
      return acc;
    }, makeStaticRemaining());
  }, []);

  const submit = (raw = input.trim()) => {
    if (!raw) return;
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: [raw],
      stamp: todayShortStamp(),
    };
    const reply = buildReply(raw, remaining);
    setMessages((m) => [...m, userMsg, reply]);
    setInput("");
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.15fr_0.55fr]">
      <Card className="flex min-h-[640px] flex-col overflow-hidden border-white/70 bg-white/60 backdrop-blur-2xl shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-white/70 px-6 py-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-slate-500">
              <BrainCircuit className="h-3.5 w-3.5" />
              AI Exchange Coach
            </div>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-slate-900">
              Always teaching, never shaming.
            </h2>
          </div>
          <Link href="/food-groups">
            <Button variant="secondary">
              <BookOpen className="h-4 w-4" />
              Open Food Groups
            </Button>
          </Link>
        </div>

        <div className="space-y-5 px-6 py-6">
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.role === "coach" ? (
                  <CoachBubble message={m} />
                ) : (
                  <UserBubble message={m} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={endRef} />
        </div>

        <div className="space-y-3 border-t border-white/70 px-6 py-5">
          <div className="flex flex-wrap gap-2">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip.prompt}
                type="button"
                onClick={() => submit(chip.prompt)}
                className="group inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-700 shadow-[0_10px_30px_-26px_rgba(15,23,42,0.5)] transition hover:bg-white"
              >
                <chip.icon className="h-4 w-4 text-slate-500 group-hover:text-slate-800" />
                {chip.title}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
            className="flex items-end gap-3 rounded-[26px] border border-white/70 bg-white/80 p-2 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)]"
          >
            <textarea
              rows={2}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder="Try: another protein than fish • I had chicken, rice, olive oil and salad • What can I eat tonight"
              className="min-h-[56px] flex-1 resize-none rounded-[22px] bg-transparent px-4 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <Button type="submit" size="lg" disabled={!input.trim()}>
              Send
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="px-1 text-xs text-slate-400">
            Category citations anchor every answer to the same Food Groups page your dietitian uses.
          </p>
        </div>
      </Card>

      <div className="space-y-5">
        <Card className="border-white/70 bg-white/60 backdrop-blur-2xl shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)]">
          <div className="flex items-center justify-between px-6 py-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                Remaining today
              </p>
              <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-slate-900">
                Your exchange budget
              </h3>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,rgba(237,232,245,0.95),rgba(229,231,237,0.9))] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="grid gap-3 px-6 pb-6">
            {FOOD_GROUPS_REFERENCE.map((g) => {
              const Icon = CATEGORY_ICON[g.category];
              const used = Math.max(
                0,
                (currentClient.plan[g.category] ?? 0) - (remaining[g.category] ?? 0),
              );
              const total = currentClient.plan[g.category] ?? 0;
              const pct = Math.min(1, total === 0 ? 0 : used / total);
              return (
                <div
                  key={g.category}
                  className={`rounded-[24px] bg-gradient-to-br ${g.accentClass} p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] ring-1 ring-white/70`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70 text-slate-700">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{g.displayName}</p>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {categoryLabels[g.category]} exchange
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900">
                        {remaining[g.category]}
                        <span className="text-sm font-normal text-slate-500"> / {total}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">left</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/70">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct * 100}%` }}
                      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-slate-700/70"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="border-white/70 bg-white/55 backdrop-blur-2xl shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)]">
          <div className="px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              One-click teaching
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-display)] text-xl text-slate-900">
              Open any exchange group
            </h3>
          </div>
          <div className="grid gap-2 px-6 pb-6 sm:grid-cols-2">
            {EXCHANGE_GROUP_ORDER.map((c) => {
              const g = FOOD_GROUPS_REFERENCE.find((x) => x.category === c)!;
              const Icon = CATEGORY_ICON[c];
              return (
                <button
                  type="button"
                  key={c}
                  onClick={() => submit(`What are ${g.displayName} exchanges?`)}
                  className="group flex items-center justify-between gap-3 rounded-[22px] border border-white/70 bg-white/75 px-4 py-3 text-left shadow-[0_12px_30px_-26px_rgba(15,23,42,0.45)] transition hover:bg-white"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(237,232,245,0.9)] text-slate-800">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-900">{g.displayName}</p>
                      <p className="text-[11px] text-slate-500">{g.foods.length} examples</p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-800" />
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function CoachBubble({ message }: { message: Message }) {
  return (
    <div className="max-w-[86%] space-y-4">
      <div className="rounded-[30px] rounded-tl-sm border border-white/70 bg-[linear-gradient(140deg,rgba(255,255,255,0.92),rgba(237,232,245,0.85))] px-5 py-4 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.4)]">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-slate-400">
          <BrainCircuit className="h-3.5 w-3.5" />
          AI Coach · {message.stamp}
        </div>
        {message.title ? (
          <p className="mt-2 font-[family-name:var(--font-display)] text-xl text-slate-900">
            {message.title}
          </p>
        ) : null}
        <div className="mt-2 space-y-2 text-[15px] leading-7 text-slate-700">
          {message.content.map((line, i) => (
            <p
              key={i}
              className="whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: line.replace(/\n/g, "<br/>") }}
            />
          ))}
        </div>

        {message.alternatives && message.alternatives.length > 0 ? (
          <div className="mt-5 space-y-3">
            {message.alternatives.map((alt, idx) => {
              const g = FOOD_GROUPS_REFERENCE.find((x) => x.category === alt.category);
              const Icon = CATEGORY_ICON[alt.category];
              return (
                <div
                  key={idx}
                  className={`rounded-[28px] bg-gradient-to-br ${g?.accentClass ?? "from-white to-[rgba(237,232,245,0.75)]"} p-4 ring-1 ring-white/70`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/80 text-slate-800">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {g?.displayName ?? alt.category} alternatives
                        </p>
                        {alt.note ? (
                          <p className="text-[11px] text-slate-500">{alt.note}</p>
                        ) : null}
                      </div>
                    </div>
                    <Link
                      href="/food-groups"
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] text-slate-500 hover:text-slate-800"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Food Groups
                    </Link>
                  </div>
                  <ul className="mt-3 grid gap-2">
                    {alt.items.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start justify-between gap-3 rounded-2xl bg-white/78 px-4 py-3 ring-1 ring-white/70"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900">{f.name}</p>
                          <p className="text-xs text-slate-500">
                            1 {categoryLabels[alt.category]} exchange = {f.serving}
                          </p>
                          {f.tips ? (
                            <p className="mt-1 text-[13px] leading-6 text-slate-500">💡 {f.tips}</p>
                          ) : null}
                        </div>
                        <p className="shrink-0 text-right text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                          {f.exchanges} ×
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : null}

        {message.questions && message.questions.length > 0 ? (
          <div className="mt-4 rounded-[24px] border border-white/70 bg-white/85 p-4 ring-1 ring-white/60">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">
              To make this more accurate
            </p>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {message.questions.map((q, i) => (
                <li key={i} className="leading-7">
                  • {q}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {message.citation ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/70 bg-white/70 px-4 py-2.5 text-[12px] text-slate-500">
            <div className="inline-flex items-center gap-2">
              <BookOpen className="h-3.5 w-3.5" />
              {message.citation}
            </div>
            <Link
              href="/food-groups"
              className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900"
            >
              Open Food Groups <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function UserBubble({ message }: { message: Message }) {
  return (
    <div className="flex max-w-[78%] flex-col items-end">
      <div className="rounded-[30px] rounded-tr-sm border border-white/60 bg-[linear-gradient(160deg,rgba(15,23,42,0.96),rgba(30,41,59,0.9))] px-5 py-4 text-[15px] leading-7 text-white shadow-[0_18px_40px_-30px_rgba(15,23,42,0.5)]">
        {message.content.map((line, i) => (
          <p key={i} className="whitespace-pre-line">
            {line}
          </p>
        ))}
      </div>
      <p className="mt-2 px-2 text-[11px] uppercase tracking-[0.25em] text-slate-400">
        You · {message.stamp}
      </p>
    </div>
  );
}

function buildReply(
  raw: string,
  remaining: Record<ExchangeCategory, number>,
): Message {
  const intent = detectIntent(raw, remaining);
  const base = {
    id: `c-${Date.now()}`,
    stamp: todayShortStamp(),
    role: "coach" as const,
  };

  switch (intent.kind) {
    case "substitute": {
      const sub = getSubstitutions(intent.category, intent.exclude, 5);
      return {
        ...base,
        title: intent.exclude
          ? `${intent.exclude ? intent.exclude[0].toUpperCase() + intent.exclude.slice(1) : ""} ${intent.category} alternatives`
          : `${FOOD_GROUPS_REFERENCE.find((g) => g.category === intent.category)?.displayName} picks`,
        content: [
          intent.exclude
            ? `You still have ${remaining[intent.category]} ${categoryLabels[intent.category]} exchange${remaining[intent.category] === 1 ? "" : "s"} left. Here are several one-exchange picks from the ${FOOD_GROUPS_REFERENCE.find((g) => g.category === intent.category)?.displayName} table — pick whichever is easiest right now.`
            : `You still have ${remaining[intent.category]} ${categoryLabels[intent.category]} exchange${remaining[intent.category] === 1 ? "" : "s"} left. Here are several flexible one-exchange choices.`,
          sub.teachingLine,
          sub.followUpSuggestion,
        ],
        citation: sub.citation,
        alternatives: [
          {
            category: intent.category,
            items: sub.alternatives,
            note: `All are 1 ${categoryLabels[intent.category]} exchange — swap 1:1 with your original choice.`,
          },
        ],
      };
    }
    case "tonight_ideas": {
      const r = buildTonightIdeas(intent.remaining);
      return {
        ...base,
        title: "Flexible dinner ideas",
        content: [r.title, ...r.body],
        citation: r.citation,
      };
    }
    case "explain_last_meal": {
      const r = buildExplainLastMeal(currentClient.recentMeals[currentClient.recentMeals.length - 1]);
      return {
        ...base,
        title: r.title,
        content: r.body,
        citation: r.citation,
      };
    }
    case "estimate_meal": {
      const r = buildEstimate(intent.rawText);
      return {
        ...base,
        title: "Exchange estimate",
        content: [r.summary],
        alternatives:
          r.detected.length > 0
            ? [
                {
                  category:
                    r.detected.find((x) => x.category !== "vegetable")?.category ?? "starch",
                  items: r.detected.map(
                    (d) =>
                      ({
                        name: `${d.food} — ${d.servingSuggestion}`,
                        serving: "",
                        exchanges: d.exchanges,
                        tips: `Detected as ${categoryLabels[d.category]}`,
                      }) as ReferenceFood,
                  ),
                  note: "Approximate — adjust portions once you know the exact amount.",
                },
              ]
            : undefined,
        questions: r.questions,
        citation: r.citation,
      };
    }
    case "teaching": {
      const r = buildTeaching(intent.category);
      return {
        ...base,
        title: r.title,
        content: r.body,
        citation: r.citation,
        alternatives: [
          {
            category: intent.category,
            items: r.alternatives as ReferenceFood[],
            note: "Each row below is 1 exchange. Swap freely within the group.",
          },
        ],
      };
    }
    default: {
      return {
        ...base,
        title: "Let me help you flexibly.",
        content: [
          "Try one of these four questions and I'll teach you, citing the food group tables:",
          "• Another protein than fish — or any other group swap",
          "• What can I eat tonight",
          "• I had chicken, rice, olive oil and salad (exchange estimate)",
          "• Explain my last meal",
          "Or click one of the group buttons on the right to open its teaching page.",
        ],
        citation: "Every answer references the Novaturient Food Groups categories.",
      };
    }
  }
}
