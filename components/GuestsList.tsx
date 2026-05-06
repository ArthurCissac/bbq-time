"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ItemEmoji } from "@/components/ItemEmoji";
import type { DashboardData } from "@/lib/dashboard";

const COOKING_LABELS: Record<string, string> = {
  saignant: "🥩 Saignant",
  a_point: "🍖 À point",
  bien_cuit: "🔥 Bien cuit",
};

export function GuestsList({
  eventId,
  initial,
}: {
  eventId: string;
  initial: DashboardData;
}) {
  const [data, setData] = useState<DashboardData>(initial);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/data`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = (await res.json()) as DashboardData;
        if (!cancelled) setData(json);
      } catch {}
    };
    tick();
    const interval = setInterval(tick, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [eventId]);

  const guests = [...data.guests].sort(
    (a, b) =>
      new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-medium">
          Invités ({guests.length})
        </h2>
        <p className="text-xs text-muted-foreground tracking-wide">
          Mise à jour automatique toutes les 3 secondes
        </p>
      </div>

      {guests.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-muted-foreground italic">
            Personne n'a encore scanné le QR.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {guests.map((g) => {
            const isOpen = openId === g.id;
            const total = g.selections.reduce((a, s) => a + s.quantity, 0);
            const joined = new Date(g.joinedAt);
            return (
              <Card key={g.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : g.id)}
                  className="w-full text-left hover:bg-muted/40 transition-colors"
                >
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-coal text-ivory flex items-center justify-center font-display text-lg shrink-0">
                        {g.firstName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-display text-lg font-medium truncate">
                          {g.firstName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Inscrit{" "}
                          {joined.toLocaleString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="secondary">
                        {total} item{total > 1 ? "s" : ""}
                      </Badge>
                      <span className="text-muted-foreground text-sm">
                        {isOpen ? "▾" : "▸"}
                      </span>
                    </div>
                  </CardContent>
                </button>
                {isOpen ? (
                  <div className="border-t bg-muted/30 p-4">
                    {g.selections.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        En train de choisir…
                      </p>
                    ) : (
                      <ul className="space-y-1.5">
                        {g.selections.map((s) => (
                          <li
                            key={s.selectionId}
                            className={`flex items-center gap-2 text-sm ${
                              s.servedAt ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            <ItemEmoji value={s.itemEmoji} size={20} />
                            <span className="font-medium">
                              {s.quantity}× {s.itemName}
                            </span>
                            {s.cookingPref ? (
                              <Badge variant="outline" className="text-[10px]">
                                {COOKING_LABELS[s.cookingPref] ?? s.cookingPref}
                              </Badge>
                            ) : null}
                            {s.servedAt ? (
                              <Badge
                                variant="outline"
                                className="text-[10px] border-green-500/60 text-green-700 dark:text-green-400"
                              >
                                ✓ Servi
                              </Badge>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
