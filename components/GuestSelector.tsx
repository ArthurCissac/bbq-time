"use client";

import { useState, useTransition } from "react";
import { upsertSelection } from "@/lib/actions/guest";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Item, Selection } from "@/lib/db/schema";

const COOKING_OPTIONS: Array<{ value: "saignant" | "a_point" | "bien_cuit"; label: string }> = [
  { value: "saignant", label: "🥩 Saignant" },
  { value: "a_point", label: "🍖 À point" },
  { value: "bien_cuit", label: "🔥 Bien cuit" },
];

const CATEGORY_LABELS: Record<string, string> = {
  viande: "🥩 Viandes",
  accompagnement: "🌽 Accompagnements",
  boisson: "🍺 Boissons",
  dessert: "🍰 Desserts",
  autre: "✨ Autre",
};

type Pick = {
  quantity: number;
  cookingPref: "saignant" | "a_point" | "bien_cuit" | null;
};

export function GuestSelector({
  eventCode,
  firstName,
  items,
  initialSelections,
  committedByOthers,
}: {
  eventCode: string;
  firstName: string;
  items: Item[];
  initialSelections: Selection[];
  committedByOthers: Record<string, number>;
}) {
  const [picks, setPicks] = useState<Record<string, Pick>>(() => {
    const m: Record<string, Pick> = {};
    for (const s of initialSelections) {
      m[s.itemId] = {
        quantity: s.quantity,
        cookingPref:
          (s.cookingPref as "saignant" | "a_point" | "bien_cuit" | null) ?? null,
      };
    }
    return m;
  });
  const [pending, startTransition] = useTransition();

  const update = (
    itemId: string,
    next: Pick,
    item: Item,
  ) => {
    setPicks((p) => ({ ...p, [itemId]: next }));
    startTransition(async () => {
      try {
        await upsertSelection(eventCode, {
          itemId,
          quantity: next.quantity,
          cookingPref: item.hasCookingPref ? next.cookingPref : null,
          notes: null,
        });
      } catch {
        toast.error("Impossible d'enregistrer. Réessaie.");
      }
    });
  };

  const grouped = items.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.category] ??= []).push(it);
    return acc;
  }, {});

  const totalCount = Object.values(picks).reduce((a, p) => a + p.quantity, 0);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Salut</p>
          <p className="text-2xl font-black">{firstName} 👋</p>
        </div>
        <Badge variant="secondary" className="text-base px-3 py-1">
          {totalCount} item{totalCount > 1 ? "s" : ""}
        </Badge>
      </header>

      {Object.entries(grouped).map(([category, list]) => (
        <section key={category} className="space-y-2">
          <h2 className="text-sm uppercase font-bold text-muted-foreground tracking-wider">
            {CATEGORY_LABELS[category] ?? category}
          </h2>
          <div className="space-y-2">
            {list.map((item) => {
              const pick = picks[item.id] ?? { quantity: 0, cookingPref: null };
              const others = committedByOthers[item.id] ?? 0;
              const cap = item.availableQty;
              const maxForMe =
                cap === null ? 20 : Math.max(0, Math.min(20, cap - others));
              const remainingAfterMe = Math.max(0, maxForMe - pick.quantity);
              const atCap = cap !== null && pick.quantity >= maxForMe;
              return (
                <Card
                  key={item.id}
                  className={
                    pick.quantity > 0
                      ? "border-2 border-red-500 bg-red-50/50"
                      : "border-2"
                  }
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="text-3xl leading-none shrink-0"
                          aria-hidden
                        >
                          {item.emoji}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-lg truncate font-display">
                            {item.name}
                          </p>
                          {item.description ? (
                            <p className="text-xs text-muted-foreground italic truncate">
                              {item.description}
                            </p>
                          ) : null}
                          {cap !== null ? (
                            <p
                              className={`text-xs font-medium ${
                                remainingAfterMe === 0
                                  ? "text-red-600"
                                  : remainingAfterMe <= 2
                                    ? "text-orange-600"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {remainingAfterMe === 0
                                ? "❌ Plus de stock"
                                : `Plus que ${remainingAfterMe} disponible${remainingAfterMe > 1 ? "s" : ""}`}
                            </p>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-11 w-11 text-xl"
                          disabled={pick.quantity === 0 || pending}
                          onClick={() =>
                            update(
                              item.id,
                              {
                                ...pick,
                                quantity: Math.max(0, pick.quantity - 1),
                              },
                              item,
                            )
                          }
                        >
                          −
                        </Button>
                        <span className="text-2xl font-black w-8 text-center">
                          {pick.quantity}
                        </span>
                        <Button
                          type="button"
                          size="icon"
                          className="h-11 w-11 text-xl bg-red-600 hover:bg-red-700"
                          disabled={pending || atCap || pick.quantity >= 20}
                          onClick={() =>
                            update(
                              item.id,
                              {
                                ...pick,
                                quantity: Math.min(maxForMe, pick.quantity + 1),
                                cookingPref:
                                  item.hasCookingPref && !pick.cookingPref
                                    ? "a_point"
                                    : pick.cookingPref,
                              },
                              item,
                            )
                          }
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    {item.hasCookingPref && pick.quantity > 0 ? (
                      <div className="flex gap-1.5 flex-wrap">
                        {COOKING_OPTIONS.map((opt) => (
                          <Button
                            key={opt.value}
                            type="button"
                            size="sm"
                            variant={
                              pick.cookingPref === opt.value
                                ? "default"
                                : "outline"
                            }
                            className={
                              pick.cookingPref === opt.value
                                ? "bg-red-600 hover:bg-red-700"
                                : ""
                            }
                            disabled={pending}
                            onClick={() =>
                              update(
                                item.id,
                                { ...pick, cookingPref: opt.value },
                                item,
                              )
                            }
                          >
                            {opt.label}
                          </Button>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      ))}

      <div className="text-center text-xs text-muted-foreground py-6">
        Tes choix sont enregistrés automatiquement 🔥
      </div>
    </div>
  );
}
