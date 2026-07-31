import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ExchangeCategory } from "@/types/app";

export type ConfirmedSnapshotItem = {
  id: string;
  userId: string;
  category: ExchangeCategory;
  categoryLabel: string;
  subcategory: string;
  name: string;
  serving: string;
  exchanges: number;
  quantity: number;
  imageUrl: string;
};

type SnapshotStore = {
  items: ConfirmedSnapshotItem[];
  confirmItem: (item: Omit<ConfirmedSnapshotItem, "id">) => void;
  removeItem: (userId: string, itemId: string) => void;
  getItemsForUser: (userId?: string | null) => ConfirmedSnapshotItem[];
};

export const useClientSnapshotStore = create<SnapshotStore>()(
  persist(
    (set, get) => ({
      items: [],
      confirmItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (entry) =>
              entry.userId === item.userId &&
              entry.name === item.name &&
              entry.category === item.category,
          );

          if (existing) {
            return {
              items: state.items.map((entry) =>
                entry.id === existing.id
                  ? {
                      ...entry,
                      quantity: item.quantity,
                      serving: item.serving,
                      exchanges: item.exchanges,
                      imageUrl: item.imageUrl,
                      subcategory: item.subcategory,
                    }
                  : entry,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                ...item,
                id: `${item.userId}-${item.category}-${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
              },
            ],
          };
        }),
      removeItem: (userId, itemId) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.userId === userId && item.id === itemId)),
        })),
      getItemsForUser: (userId) =>
        !userId ? [] : get().items.filter((item) => item.userId === userId),
    }),
    {
      name: "novaturient-client-snapshot",
    },
  ),
);
