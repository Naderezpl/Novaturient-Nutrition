"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(229,231,237,0.86),_rgba(237,232,245,0.94))]">
        <div className="mx-auto flex min-h-[80vh] max-w-[1000px] flex-col items-center justify-center px-4 py-24 lg:px-6">
          <div className="w-full rounded-[34px] border border-white/70 bg-white/58 p-10 text-center shadow-[0_28px_80px_-42px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
            <p className="text-[11px] uppercase tracking-[0.42em] text-slate-400">404</p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-tight text-slate-900 md:text-6xl">
              Page not found
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-500">
              The page you are looking for does not exist or has been moved. Try the
              home page or sign in to your workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/">
                <Button size="lg">
                  <Home className="h-4 w-4" />
                  Go home
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">
                  <ArrowLeft className="h-4 w-4" />
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
