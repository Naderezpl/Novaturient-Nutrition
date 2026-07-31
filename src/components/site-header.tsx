"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

const links = [
  { label: "Food groups", href: "/food-groups" },
  { label: "Learning", href: "/#learn" },
  { label: "For dietitians", href: "/#dietitians" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={false}
        animate={scrolled ? "raised" : "flat"}
        variants={{
          flat: {
            boxShadow: "0 0 0 0 rgba(15, 23, 42, 0)",
            backgroundColor: "rgba(255, 255, 255, 0)",
            borderBottomColor: "rgba(255, 255, 255, 0)",
          },
          raised: {
            boxShadow:
              "0 24px 70px -40px rgba(15, 23, 42, 0.35), 0 1px 0 rgba(255, 255, 255, 0.7) inset",
            backgroundColor: "rgba(255, 255, 255, 0.62)",
            borderBottomColor: "rgba(255, 255, 255, 0.75)",
          },
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-4 z-[60] px-4 lg:px-6"
        style={{ WebkitBackdropFilter: "blur(24px) saturate(120%)" }}
      >
        <div
          className={`mx-auto flex h-20 max-w-[1450px] items-center justify-between gap-4 rounded-[30px] border border-transparent px-4 lg:px-6 ${
            scrolled ? "backdrop-blur-3xl" : "backdrop-blur-xl"
          }`}
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-900 transition hover:opacity-90"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(140deg,rgba(237,232,245,1),rgba(229,231,237,0.9))] text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              <Sparkles className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <span className="font-[family-name:var(--font-display)] text-[1.35rem] leading-none tracking-tight text-slate-900">
              Novaturient
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-white/60 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login">
              <Button variant="ghost">Client login</Button>
            </Link>
            <Link href="/login?role=dietitian">
              <Button variant="secondary">Dietitian</Button>
            </Link>
            <Link href="/signup">
              <Button>
                Get started
                <motion.span
                  aria-hidden
                  animate={{ x: [0, 2, 0] }}
                  transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
                  className="ml-1 inline-flex"
                >
                  →
                </motion.span>
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/70 bg-white/60 text-slate-700 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] backdrop-blur-xl md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="sheet"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[70] flex justify-end md:hidden"
          >
            <div
              className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex h-full w-[86%] max-w-sm flex-col gap-2 border-l border-white/70 bg-gradient-to-b from-white/95 via-white/85 to-[rgba(237,232,245,0.8)] p-5 shadow-[-40px_0_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur-3xl"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="font-[family-name:var(--font-display)] text-lg text-slate-900">
                  Novaturient
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/70 text-slate-700"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>
              <div className="mt-3 flex flex-col gap-1">
                {links.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base text-slate-700 hover:bg-white/70 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-center">
                    Client login
                  </Button>
                </Link>
                <Link href="/login?role=dietitian" onClick={() => setOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">
                    Dietitian
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full justify-center">Get started</Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
