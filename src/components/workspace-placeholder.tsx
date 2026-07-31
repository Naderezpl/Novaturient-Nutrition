import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type WorkspacePlaceholderProps = {
  eyebrow: string;
  title: string;
  body: string;
  primaryHref?: string;
  primaryLabel?: string;
};

export function WorkspacePlaceholder({
  eyebrow,
  title,
  body,
  primaryHref,
  primaryLabel,
}: WorkspacePlaceholderProps) {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/60 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
      <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">{eyebrow}</p>
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl text-slate-900">
        {title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{body}</p>

      {primaryHref && primaryLabel ? (
        <div className="mt-5">
          <Link href={primaryHref}>
            <Button variant="secondary">
              {primaryLabel}
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
