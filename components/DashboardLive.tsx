"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ItemEmoji } from "@/components/ItemEmoji";
import { toggleSelectionServed } from "@/lib/actions/admin";
import type { DashboardData } from "@/lib/dashboard";

const COOKING_LABELS: Record<string, string> = {
  saignant: "🥩 Saignant",
  a_point: "🍖 À point",
  bien_cuit: "🔥 Bien cuit",
};

export function DashboardLive({
  eventId,
  initial,
}: {
  eventId: string;
  initial: DashboardData;
}) {
  const [data, setData] = useState<DashboardData>(initial);
  const [connected, setConnected] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}/data`, {
          cache: "no-store",
        });
        if (!res.ok) {
          setConnected(false);
          return;
        }
        const json = (await res.json()) as DashboardData;
        if (!cancelled) {
          setData(json);
          setConnected(true);
        }
      } catch {
        setConnected(false);
      }
    };
    tick();
    const interval = setInterval(tick, 3000);

    const onFocus = () => tick();
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [eventId]);

  const toggleExpand = (itemId: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(itemId)) next.delete(itemId);
      else next.add(itemId);
      return next;
    });
  };

  const onToggleSelection = (
    selectionId: string,
    currentlyServed: boolean,
  ) => {
    setPendingIds((s) => new Set(s).add(selectionId));
    // optimistic update
    setData((d) => ({
      ...d,
      totals: d.totals.map((t) => {
        const target = t.participants.find(
          (p) => p.selectionId === selectionId,
        );
        if (!target) return t;
        const newParticipants = t.participants.map((p) =>
          p.selectionId === selectionId
            ? { ...p, served: !currentlyServed }
            : p,
        );
        const newRemaining = newParticipants
          .filter((p) => !p.served)
          .reduce((acc, p) => acc + p.quantity, 0);
        return {
          ...t,
          participants: newParticipants,
          remainingQty: newRemaining,
          allServed: newParticipants.length > 0 && newRemaining === 0,
        };
      }),
      guests: d.guests.map((g) => ({
        ...g,
        selections: g.selections.map((s) =>
          s.selectionId === selectionId
            ? {
                ...s,
                servedAt: currentlyServed ? null : new Date().toISOString(),
              }
            : s,
        ),
      })),
    }));
    startTransition(async () => {
      try {
        await toggleSelectionServed(eventId, selectionId, !currentlyServed);
      } finally {
        setPendingIds((s) => {
          const next = new Set(s);
          next.delete(selectionId);
          return next;
        });
      }
    });
  };

  const grouped = data.totals.reduce<Record<string, typeof data.totals>>(
    (acc, t) => {
      (acc[t.category] ??= []).push(t);
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            connected ? "bg-green-500 animate-pulse" : "bg-gray-300"
          }`}
        />
        {connected ? "Live" : "Connexion…"}
        <span className="ml-auto text-muted-foreground">
          {data.guests.length} invité{data.guests.length > 1 ? "s" : ""}
        </span>
      </div>

      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle>📋 Liste de courses</CardTitle>
          <p className="text-sm text-muted-foreground">
            Clique sur un item pour voir qui l'attend, puis coche au fur et à
            mesure que tu sers.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(grouped).map(([category, list]) => (
            <div key={category}>
              <h3 className="font-bold text-sm uppercase text-muted-foreground mb-2">
                {category}
              </h3>
              <div className="space-y-1.5">
                {list.map((t) => {
                  const isExpanded = expanded.has(t.itemId);
                  const done = t.allServed;
                  return (
                    <div
                      key={t.itemId}
                      className={`rounded overflow-hidden border transition-colors ${
                        done
                          ? "bg-green-50/60 border-green-200"
                          : "bg-orange-50"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleExpand(t.itemId)}
                        className={`w-full flex items-center justify-between p-2 transition-colors text-left ${
                          done ? "hover:bg-green-100" : "hover:bg-orange-100"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">
                            {isExpanded ? "▾" : "▸"}
                          </span>
                          <ItemEmoji value={t.emoji} size={26} />
                          <span
                            className={`font-medium ${
                              done ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {t.name}
                          </span>
                          {done ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-green-500 text-green-700"
                            >
                              ✓ Tout servi
                            </Badge>
                          ) : null}
                        </span>
                        <div className="flex items-center gap-2">
                          {t.hasCookingPref &&
                            !done &&
                            Object.entries(t.cookingBreakdown).map(
                              ([pref, q]) => (
                                <Badge
                                  key={pref}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {COOKING_LABELS[pref] ?? pref}: {q}
                                </Badge>
                              ),
                            )}
                          <span
                            className={`text-xl font-black min-w-[2rem] text-right ${
                              done ? "text-muted-foreground" : "text-red-600"
                            }`}
                          >
                            {t.remainingQty}
                            {t.availableQty !== null ? (
                              <span className="text-sm text-muted-foreground font-normal">
                                {" "}
                                / {t.availableQty}
                              </span>
                            ) : null}
                          </span>
                        </div>
                      </button>
                      {isExpanded ? (
                        <div className="border-t bg-white p-2 space-y-1">
                          {t.participants.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic px-2 py-1">
                              Personne n'a commandé cet item.
                            </p>
                          ) : (
                            t.participants.map((p) => (
                              <button
                                key={p.selectionId}
                                type="button"
                                onClick={() =>
                                  onToggleSelection(p.selectionId, p.served)
                                }
                                disabled={pendingIds.has(p.selectionId)}
                                className={`w-full flex items-center justify-between gap-2 p-2 rounded border disabled:cursor-wait transition-colors ${
                                  p.served
                                    ? "bg-red-50 border-red-200 hover:bg-red-100"
                                    : "border-transparent hover:bg-green-50 hover:border-green-200"
                                }`}
                              >
                                <span
                                  className={`flex items-center gap-2 ${
                                    p.served
                                      ? "line-through text-red-700"
                                      : ""
                                  }`}
                                >
                                  <span
                                    className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 text-xs ${
                                      p.served
                                        ? "bg-red-600 border-red-600 text-white"
                                        : "border-gray-300"
                                    }`}
                                  >
                                    {p.served ? "✓" : ""}
                                  </span>
                                  <span className="font-medium">
                                    {p.guestName}
                                  </span>
                                  <span
                                    className={
                                      p.served
                                        ? "text-sm text-red-600/70"
                                        : "text-sm text-muted-foreground"
                                    }
                                  >
                                    {p.quantity}×
                                  </span>
                                  {p.cookingPref ? (
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] ${
                                        p.served
                                          ? "border-red-300 text-red-700"
                                          : ""
                                      }`}
                                    >
                                      {COOKING_LABELS[p.cookingPref] ??
                                        p.cookingPref}
                                    </Badge>
                                  ) : null}
                                </span>
                                <span
                                  className={`text-xs font-medium ${
                                    p.served
                                      ? "text-red-700"
                                      : "text-green-700"
                                  }`}
                                >
                                  {p.served ? "Annuler" : "Marquer servi ✓"}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {data.totals.length === 0 ? (
            <p className="text-muted-foreground italic">
              Aucune commande pour l'instant.
            </p>
          ) : null}
          {data.totals.length > 0 && data.totals.every((t) => t.allServed) ? (
            <p className="text-green-700 font-medium text-center py-2">
              ✓ Tout a été servi !
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>👥 Qui veut quoi</CardTitle>
          <p className="text-sm text-muted-foreground">
            Clique sur chaque item pour le marquer servi.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.guests.length === 0 ? (
            <p className="text-muted-foreground italic">
              Personne n'a encore scanné le QR.
            </p>
          ) : (
            data.guests.map((g) => {
              const allServed =
                g.selections.length > 0 &&
                g.selections.every((s) => s.servedAt);
              return (
                <div
                  key={g.id}
                  className={`border-l-4 pl-3 py-1 transition-colors ${
                    allServed ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{g.firstName}</p>
                    {allServed ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] border-green-500 text-green-700"
                      >
                        Tout servi ✓
                      </Badge>
                    ) : null}
                  </div>
                  {g.selections.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic mt-1">
                      En train de choisir…
                    </p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {g.selections.map((s) => {
                        const served = !!s.servedAt;
                        const pending = pendingIds.has(s.selectionId);
                        return (
                          <li key={s.selectionId}>
                            <button
                              type="button"
                              onClick={() =>
                                onToggleSelection(s.selectionId, served)
                              }
                              disabled={pending}
                              className={`flex items-center gap-2 text-left text-sm w-full hover:opacity-70 disabled:cursor-wait py-0.5 ${
                                served ? "text-muted-foreground" : ""
                              }`}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-4 h-4 rounded border-2 transition-colors shrink-0 text-[10px] ${
                                  served
                                    ? "bg-green-500 border-green-500 text-white"
                                    : "border-gray-300"
                                }`}
                              >
                                {served ? "✓" : ""}
                              </span>
                              <span
                                className={`flex items-center gap-1.5 ${
                                  served ? "line-through" : ""
                                }`}
                              >
                                <ItemEmoji value={s.itemEmoji} size={18} />
                                {s.quantity}× {s.itemName}
                                {s.cookingPref ? (
                                  <span className="text-muted-foreground">
                                    {" "}
                                    (
                                    {COOKING_LABELS[s.cookingPref] ??
                                      s.cookingPref}
                                    )
                                  </span>
                                ) : null}
                                {s.notes ? (
                                  <span className="text-muted-foreground italic">
                                    {" "}
                                    — {s.notes}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
