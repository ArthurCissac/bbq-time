"use client";

import { useState, useTransition } from "react";
import { updateItemQty, deleteItem } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Item } from "@/lib/db/schema";

const CATEGORY_LABELS: Record<string, string> = {
  viande: "🥩 Viande",
  accompagnement: "🌽 Accomp.",
  boisson: "🍺 Boisson",
  dessert: "🍰 Dessert",
  autre: "✨ Autre",
};

function ItemRow({ item, eventId }: { item: Item; eventId: string }) {
  const [qty, setQty] = useState<string>(
    item.availableQty?.toString() ?? "",
  );
  const [pending, startTransition] = useTransition();

  const save = () => {
    const parsed = qty === "" ? null : Number(qty);
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) return;
    startTransition(async () => {
      await updateItemQty(eventId, item.id, parsed);
    });
  };

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <span className="text-2xl shrink-0">{item.emoji}</span>
          <div className="min-w-0">
            <p className="font-semibold truncate">{item.name}</p>
            <div className="flex gap-1.5 mt-0.5 flex-wrap">
              <Badge variant="secondary" className="text-xs">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </Badge>
              {item.hasCookingPref ? (
                <Badge variant="outline" className="text-xs">
                  🔥 Cuisson
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1">
            <Input
              type="number"
              min={0}
              max={9999}
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="—"
              className="w-16 h-8 text-center"
              disabled={pending}
            />
            <span className="text-xs text-muted-foreground">dispo</span>
          </div>
          <form
            action={async () => {
              await deleteItem(eventId, item.id);
            }}
          >
            <Button variant="ghost" size="sm" type="submit" disabled={pending}>
              🗑
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

export function ItemsList({
  items,
  eventId,
}: {
  items: Item[];
  eventId: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground italic">
        Aucun item. Utilise les suggestions au-dessus ou ajoute manuellement.
      </p>
    );
  }
  return (
    <div className="grid gap-2">
      {items.map((it) => (
        <ItemRow key={it.id} item={it} eventId={eventId} />
      ))}
    </div>
  );
}
