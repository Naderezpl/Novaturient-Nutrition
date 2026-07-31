"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, BrainCircuit, HeartHandshake, HeartPulse, ShieldCheck, Sparkles, Users } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { clients, coachPrompts, defaultClientPlan, lessons } from "@/lib/demo-data";

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[560px] w-[980px] -translate-x-1/2 rounded-full bg-[conic-gradient(from_220deg,rgba(237,232,245,0.75),rgba(229,231,237,0.55),rgba(237,232,245,0.8))] opacity-80 blur-3xl" />
          <div className="absolute top-80 -right-40 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(237,232,245,0.8),rgba(229,231,237,0.2)_60%,transparent_70%)] blur-3xl" />
          <div className="absolute top-[720px] -left-28 h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_70%_30%,rgba(229,231,237,0.75),rgba(237,232,245,0.25)_60%,transparent_75%)] blur-3xl" />
        </div>

        <div className="mx-auto max-w-[1450px] space-y-6 px-4 pb-24 pt-10 lg:px-6 lg:pt-14">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-[34px] border border-white/70 bg-white/55 p-5 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.45)] backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Novaturient Nutrition</p>
                <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-900">
                  Elegant exchange-based nutrition care
                </h1>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/food-groups">
                  <Button variant="secondary">
                    <BookOpen className="h-4 w-4" />
                    Food groups
                  </Button>
                </Link>
                <Link href="/login">
                  <Button>Open workspace</Button>
                </Link>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[32px] bg-[linear-gradient(140deg,rgba(255,255,255,0.84),rgba(237,232,245,0.78),rgba(229,231,237,0.65))] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/65 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-500 shadow-[0_12px_30px_-24px_rgba(15,23,42,0.35)]">
                  <HeartPulse className="h-4 w-4" />
                  Premium healthcare aesthetic
                </div>
                <h2 className="mt-6 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[1.05] text-slate-900 md:text-6xl">
                  Teach flexibility, track exchanges, and make nutrition feel calm again.
                </h2>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                  A soft, polished SaaS experience for clients and dietitians: meal building, adherence tracking, food
                  learning, AI coaching, and a Food Groups page organized into clickable categories and smaller groups.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/signup">
                    <Button size="lg">
                      Start as client
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login?role=dietitian">
                    <Button size="lg" variant="secondary">
                      Dietitian login
                    </Button>
                  </Link>
                </div>
                <motion.dl
                  initial="start"
                  transition={{ staggerChildren: 0.05, delayChildren: 0.1 }}
                  className="mt-8 grid gap-4 md:grid-cols-3"
                >
                  {[
                    ["30+", "demo clients"],
                    ["300+", "exchange foods"],
                    ["11", "lesson topics"],
                  ].map(([value, label]) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      className="rounded-[24px] border border-white/70 bg-white/72 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.35)]"
                    >
                      <dt className="text-3xl font-semibold text-slate-900">{value}</dt>
                      <dd className="mt-1 text-sm text-slate-500">{label}</dd>
                    </motion.div>
                  ))}
                </motion.dl>
              </div>

              <div className="grid gap-4">
                <Card className="overflow-hidden shadow-[0_26px_70px_-40px_rgba(15,23,42,0.45)]">
                  <CardHeader>
                    <CardDescription>Today&apos;s exchange plan</CardDescription>
                    <CardTitle>Client snapshot</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {Object.entries(defaultClientPlan).map(([category, total]) => (
                      <div
                        key={category}
                        className="rounded-[22px] bg-white/80 p-4 ring-1 ring-white/70"
                      >
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{category}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{total}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="shadow-[0_26px_70px_-40px_rgba(15,23,42,0.45)]">
                  <CardHeader>
                    <CardDescription>Encouraging AI Coach</CardDescription>
                    <CardTitle>Prompt ideas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {coachPrompts.map((prompt) => (
                      <div key={prompt.id} className="rounded-[22px] bg-white/80 p-4">
                        <p className="text-sm font-medium text-slate-900">{prompt.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{prompt.prompt}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.section>

          <section id="learn" className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <Card className="shadow-[0_26px_70px_-40px_rgba(15,23,42,0.45)]">
              <CardHeader>
                <CardDescription>Designed for client confidence</CardDescription>
                <CardTitle>What the platform includes</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {[
                  {
                    icon: Sparkles,
                    title: "Dashboard elegance",
                    body: "Floating exchange cards, weekly adherence trends, weight and water tracking, recent meals, and quick actions.",
                  },
                  {
                    icon: BrainCircuit,
                    title: "AI exchange coach",
                    body: "Education-first responses that suggest flexible meal ideas without shame or rigid meal plans.",
                  },
                  {
                    icon: BookOpen,
                    title: "Learning center",
                    body: "Portion size lessons, grocery skills, hydration guidance, and challenge mode with supportive feedback.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Dietitian tools",
                    body: "Client management, exchange prescriptions, analytics, adherence review, and report-ready data views.",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[24px] bg-white/75 p-5">
                    <item.icon className="h-5 w-5 text-slate-600" />
                    <p className="mt-4 text-lg font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{item.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="dietitians" className="shadow-[0_26px_70px_-40px_rgba(15,23,42,0.45)]">
              <CardHeader>
                <CardDescription>Demo content baked in</CardDescription>
                <CardTitle>Ready-made datasets for showing the product</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] bg-white/78 p-5 ring-1 ring-white/70">
                    <p className="text-sm font-medium text-slate-900">Client dashboard</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">Personal nutrition workspace</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Goal-based exchange tracking • activity-aware coaching
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white/78 p-5 ring-1 ring-white/70">
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                      <Users className="h-4 w-4" />
                      Client roster
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{clients.length} premium profiles</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Each one includes adherence, meals, water, and weight trends.
                    </p>
                  </div>
                </div>

                <div className="rounded-[28px] bg-[linear-gradient(135deg,rgba(255,255,255,0.78),rgba(237,232,245,0.65))] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Lessons available</p>
                      <p className="mt-2 text-sm text-slate-500">
                        Every lesson includes practical tips and key takeaways.
                      </p>
                    </div>
                    <p className="text-3xl font-semibold text-slate-900">{lessons.length}</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lessons.slice(0, 6).map((lesson) => (
                      <span
                        key={lesson.slug}
                        className="rounded-full bg-white/80 px-3 py-2 text-xs text-slate-500 ring-1 ring-white/70"
                      >
                        {lesson.title}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-white/65 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(237,232,245,1)] text-slate-700">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">For dietitians</p>
                      <p className="mt-0.5 text-sm text-slate-500">
                        Assign exchange targets, review adherence, and export reports.
                      </p>
                    </div>
                  </div>
                  <Link href="/login?role=dietitian">
                    <Button variant="secondary">Dietitian workspace</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </>
  );
}
