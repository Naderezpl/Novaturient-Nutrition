"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BookOpen, Check, Minus, Plus, Trash2 } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { FOOD_GROUPS_CATALOG } from "@/features/food-groups/catalog";
import { useAuthStore } from "@/lib/auth-store";
import { useClientSnapshotStore } from "@/lib/client-snapshot-store";
import { getClientRecordForEmail } from "@/lib/demo-data";

export default function FoodGroupsPage() {
  const hydrated = useAuthStore((state) => state.hydrated);
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.role);

  const content = <FoodGroupsContent />;

  if (hydrated && user && role === "client") {
    const client = getClientRecordForEmail(user.email);

    return (
      <AppShell
        role="client"
        title={`${client.user.fullName}'s Dashboard`}
        subtitle="Food Groups organized into categories and smaller groups so you can add and confirm items directly into your dashboard."
        actions={
          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-600">
            Food Groups tab
          </div>
        }
      >
        {content}
      </AppShell>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(229,231,237,0.86),_rgba(237,232,245,0.94))] pb-20">
        <div className="mx-auto max-w-[1450px] px-4 py-10 lg:px-6">{content}</div>
      </main>
    </>
  );
}

function FoodGroupsContent() {
  const user = useAuthStore((state) => state.user);
  const allItems = useClientSnapshotStore((state) => state.items);
  const confirmItem = useClientSnapshotStore((state) => state.confirmItem);
  const removeItem = useClientSnapshotStore((state) => state.removeItem);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const items = useMemo(
    () => (!user ? [] : allItems.filter((item) => item.userId === user.id)),
    [allItems, user],
  );

  const totalConfirmed = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/70 bg-white/60 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Food Groups</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-slate-900">
              Categories, subcategories, and foods.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              Jump by category, then by smaller group inside each category. Use the
              counter to add a quantity, confirm it, and remove it later from your dashboard snapshot.
            </p>
          </div>
          {!user ? (
            <Link href="/login">
              <Button>
                <BookOpen className="h-4 w-4" />
                Log in to confirm foods
              </Button>
            </Link>
          ) : (
            <div className="rounded-[24px] border border-white/70 bg-white/75 px-5 py-4 text-sm text-slate-600">
              Confirmed in dashboard: <span className="font-semibold text-slate-900">{totalConfirmed}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {FOOD_GROUPS_CATALOG.map((section) => (
            <a
              key={section.category}
              href={section.categoryHref}
              className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900"
            >
              {section.categoryLabel}
            </a>
          ))}
        </div>
      </section>

      {user ? (
        <section className="rounded-[32px] border border-white/70 bg-white/60 p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)] backdrop-blur-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-slate-400">Dashboard Snapshot</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl text-slate-900">
                Confirmed foods for {user.fullName}
              </h2>
            </div>
          </div>

          {items.length ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[26px] border border-white/70 bg-white/78 p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.categoryLabel} • {item.subcategory}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(user.id, item.id)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/70 bg-white/80 text-slate-500 transition hover:text-slate-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{item.serving}</p>
                  <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                    <span>{item.quantity} confirmed</span>
                    <span>{item.exchanges} exchange each</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 text-sm text-slate-500">
              No confirmed foods yet. Use the cards below, choose a quantity, and press Confirm.
            </p>
          )}
        </section>
      ) : null}

      {FOOD_GROUPS_CATALOG.map((section) => (
        <section
          key={section.category}
          id={section.categoryHref.slice(1)}
          className={`rounded-[34px] border border-white/70 bg-gradient-to-br ${section.accentClass} p-6 shadow-[0_28px_80px_-42px_rgba(15,23,42,0.35)]`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.32em] text-slate-500">{section.categoryLabel}</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl text-slate-900">
                {section.categoryLabel}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{section.description}</p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 text-sm text-slate-600">
              {section.exchangeSummary}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {section.subcategories.map((subcategory) => (
              <a
                key={subcategory.href}
                href={subcategory.href}
                className="rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900"
              >
                {subcategory.name}
              </a>
            ))}
          </div>

          <div className="mt-8 space-y-8">
            {section.subcategories.map((subcategory) => (
              <div key={subcategory.href} id={subcategory.href.slice(1)} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-[family-name:var(--font-display)] text-2xl text-slate-900">
                    {subcategory.name}
                  </h3>
                  <a
                    href={section.categoryHref}
                    className="text-xs uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-900"
                  >
                    Back to {section.categoryLabel}
                  </a>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {subcategory.items.map((item) => {
                    const quantity = quantities[item.id] ?? 0;

                    return (
                      <article
                        key={item.id}
                        className="overflow-hidden rounded-[28px] border border-white/70 bg-white/82 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.3)]"
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-48 w-full object-cover"
                          draggable={false}
                        />
                        <div className="space-y-4 p-5">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                              {item.categoryLabel} • {item.subcategory}
                            </p>
                            <h4 className="mt-2 text-xl font-semibold text-slate-900">{item.name}</h4>
                            <p className="mt-2 text-sm text-slate-600">{item.serving}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.exchanges} exchange each</p>
                            {item.tips ? (
                              <p className="mt-3 text-sm leading-6 text-slate-500">{item.tips}</p>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="inline-flex items-center rounded-full border border-white/70 bg-white/85">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantities((current) => ({
                                    ...current,
                                    [item.id]: Math.max(0, (current[item.id] ?? 0) - 1),
                                  }))
                                }
                                className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition hover:text-slate-900"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantities((current) => ({
                                    ...current,
                                    [item.id]: (current[item.id] ?? 0) + 1,
                                  }))
                                }
                                className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition hover:text-slate-900"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <Button
                              disabled={!user || quantity < 1}
                              onClick={() =>
                                user &&
                                confirmItem({
                                  userId: user.id,
                                  category: item.category,
                                  categoryLabel: item.categoryLabel,
                                  subcategory: item.subcategory,
                                  name: item.name,
                                  serving: item.serving,
                                  exchanges: item.exchanges,
                                  quantity,
                                  imageUrl: item.imageUrl,
                                })
                              }
                            >
                              <Check className="h-4 w-4" />
                              Confirm
                            </Button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
