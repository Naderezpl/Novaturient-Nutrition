import * as React from "react";

import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-white/60 bg-white/70 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-white focus:ring-2 focus:ring-white/80",
        className,
      )}
      {...props}
    />
  );
}
