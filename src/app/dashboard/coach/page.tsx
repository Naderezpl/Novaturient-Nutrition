import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

import { AppShell, RoleGuard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { CoachChat } from "@/features/coach/coach-chat";
import { motivationalMessages } from "@/lib/demo-data";

export default function DashboardCoachPage() {
  const msg = motivationalMessages[new Date().getDay() % motivationalMessages.length];

  return (
    <RoleGuard role="client">
      <AppShell
        role="client"
        title="AI Exchange Coach"
        subtitle="Your patient, encouraging dietitian — always citing the Food Groups page."
        actions={
          <Link href="/food-groups">
            <Button variant="secondary">
              <BookOpen className="h-4 w-4" />
              Food Groups
            </Button>
          </Link>
        }
      >
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-[32px] border border-white/70 bg-white/60 px-6 py-6 backdrop-blur-2xl shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
                Main feature · page-backed
              </p>
              <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-slate-900">
                Kind, education-first coaching.
              </h1>
              <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-500">
                Ask for substitutions like "another protein than fish" and you&apos;ll get several
                one-exchange picks — each citing the <em>Food Groups</em> category and smaller group
                by name.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/food-groups">
                <Button variant="secondary">
                  <BookOpen className="h-4 w-4" />
                  Open Food Groups
                </Button>
              </Link>
              <Link href="/login?role=dietitian">
                <Button>
                  <Sparkles className="h-4 w-4" />
                  Dietitian workspace
                </Button>
              </Link>
            </div>
          </div>

          <CoachChat />

          <div className="rounded-[28px] border border-white/70 bg-[linear-gradient(140deg,rgba(237,232,245,0.9),rgba(229,231,237,0.8))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
            <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">
              {msg.title}
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-2xl leading-8 text-slate-900">
              &ldquo;{msg.body}&rdquo;
            </p>
            <p className="mt-2 text-sm text-slate-600">— Novaturient</p>
          </div>
        </div>
      </AppShell>
    </RoleGuard>
  );
}
