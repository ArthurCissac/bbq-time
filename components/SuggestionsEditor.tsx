"use client";

import { useState, useTransition, useEffect } from "react";
import {
  upsertSuggestion,
  deleteSuggestion,
  seedDefaultSuggestions,
  clearSuggestions,
} from "@/lib/actions/suggestions";
import {
  emojiFor,
  categoryFor,
  shouldHaveCookingPref,
  type Category,
} from "@/lib/suggestions";
import type { SuggestionRow } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FoodIcon } from "@/components/FoodIcon";

const CATEGORY_LABELS: Record<Category, string> = {
  viande: "🥩 Viande",
  accompagnement: "🌽 Accompagnement",
  boisson: "🍺 Boisson",
  dessert: "🍰 Dessert",
  autre: "✨ Autre",
};

function AddRow() {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍖");
  const [category, setCategory] = useState<Category>("viande");
  const [hasCookingPref, setHasCookingPref] = useState(false);
  const [defaultQty, setDefaultQty] = useState<string>("10");
  const [pending, startTransition] = useTransition();

  const [emojiManual, setEmojiManual] = useState(false);
  const [categoryManual, setCategoryManual] = useState(false);
  const [cookingManual, setCookingManual] = useState(false);

  useEffect(() => {
    if (!emojiManual) setEmoji(emojiFor(name));
    if (!categoryManual) setCategory(categoryFor(name));
    if (!cookingManual) setHasCookingPref(shouldHaveCookingPref(name));
  }, [name, emojiManual, categoryManual, cookingManual]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await upsertSuggestion({
        name: name.trim(),
        emoji,
        category,
        hasCookingPref,
        defaultQty: Number(defaultQty || 0),
        sortOrder: 0,
      });
      setName("");
      setEmoji("🍖");
      setCategory("viande");
      setHasCookingPref(false);
      setDefaultQty("10");
      setEmojiManual(false);
      setCategoryManual(false);
      setCookingManual(false);
    });
  };

  return (
    <Card className="border-2 border-orange-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">
          ➕ Ajouter une suggestion (réutilisable)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 grid-cols-[80px_1fr]">
            <div className="space-y-1">
              <Label>Emoji</Label>
              <Input
                value={emoji}
                onChange={(e) => {
                  setEmoji(e.target.value);
                  setEmojiManual(true);
                }}
                maxLength={4}
                className="text-center text-lg"
              />
            </div>
            <div className="space-y-1">
              <Label>Nom</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={40}
                placeholder="ex: Tofu grillé, Halloumi, Crevettes…"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label>Catégorie</Label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as Category);
                  setCategoryManual(true);
                }}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Quantité par défaut</Label>
              <Input
                type="number"
                min={0}
                max={9999}
                value={defaultQty}
                onChange={(e) => setDefaultQty(e.target.value)}
              />
            </div>
            <label className="flex items-end gap-2 text-sm pb-2">
              <input
                type="checkbox"
                checked={hasCookingPref}
                onChange={(e) => {
                  setHasCookingPref(e.target.checked);
                  setCookingManual(true);
                }}
                className="h-4 w-4"
              />
              Cuisson au choix
            </label>
          </div>

          <Button
            type="submit"
            disabled={pending || !name.trim()}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            Ajouter {emoji} {name.trim() || "..."}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function EditRow({ row }: { row: SuggestionRow }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(row.name);
  const [emoji, setEmoji] = useState(row.emoji);
  const [category, setCategory] = useState<Category>(row.category as Category);
  const [hasCookingPref, setHasCookingPref] = useState(row.hasCookingPref);
  const [defaultQty, setDefaultQty] = useState(row.defaultQty.toString());
  const [pending, startTransition] = useTransition();

  const save = () => {
    startTransition(async () => {
      await upsertSuggestion({
        id: row.id,
        name: name.trim(),
        emoji,
        category,
        hasCookingPref,
        defaultQty: Number(defaultQty || 0),
        sortOrder: row.sortOrder,
      });
      setEditing(false);
    });
  };

  const remove = () => {
    if (!confirm(`Supprimer la suggestion "${row.name}" ?`)) return;
    startTransition(async () => {
      await deleteSuggestion(row.id);
    });
  };

  if (!editing) {
    return (
      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FoodIcon
              name={row.name}
              emoji={row.emoji}
              size={32}
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">{row.name}</p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap items-center">
                <Badge variant="secondary" className="text-xs">
                  {CATEGORY_LABELS[row.category as Category] ?? row.category}
                </Badge>
                {row.hasCookingPref ? (
                  <Badge variant="outline" className="text-xs">
                    🔥 Cuisson
                  </Badge>
                ) : null}
                <span className="text-xs text-muted-foreground">
                  Défaut : {row.defaultQty}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              Éditer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={remove}
              disabled={pending}
            >
              🗑
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-red-300">
      <CardContent className="p-3 space-y-3">
        <div className="grid gap-2 grid-cols-[60px_1fr]">
          <Input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            maxLength={4}
            className="text-center text-lg"
          />
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
          <Input
            type="number"
            min={0}
            max={9999}
            value={defaultQty}
            onChange={(e) => setDefaultQty(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={hasCookingPref}
              onChange={(e) => setHasCookingPref(e.target.checked)}
              className="h-4 w-4"
            />
            Cuisson
          </label>
        </div>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(false)}
            disabled={pending}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={save}
            disabled={pending || !name.trim()}
            className="bg-red-600 hover:bg-red-700"
          >
            Enregistrer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function SuggestionsEditor({ rows }: { rows: SuggestionRow[] }) {
  const [pending, startTransition] = useTransition();

  const seed = () => {
    startTransition(async () => {
      await seedDefaultSuggestions();
    });
  };

  const wipe = () => {
    if (!confirm("Tout supprimer ? Cette action est irréversible.")) return;
    startTransition(async () => {
      await clearSuggestions();
    });
  };

  const grouped = rows.reduce<Record<string, SuggestionRow[]>>((acc, r) => {
    (acc[r.category] ??= []).push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <AddRow />

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <p className="text-sm text-muted-foreground">
          {rows.length} suggestion{rows.length > 1 ? "s" : ""}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={seed}
            disabled={pending}
          >
            Importer les défauts
          </Button>
          {rows.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={wipe}
              disabled={pending}
              className="text-red-600 hover:text-red-700"
            >
              Tout vider
            </Button>
          ) : null}
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center space-y-3">
            <p className="text-muted-foreground">
              Aucune suggestion pour l'instant.
            </p>
            <Button
              onClick={seed}
              disabled={pending}
              className="bg-red-600 hover:bg-red-700"
            >
              Importer les 24 suggestions par défaut
            </Button>
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).map(([cat, list]) => (
          <section key={cat} className="space-y-2">
            <h3 className="text-sm uppercase font-bold text-muted-foreground tracking-wider">
              {CATEGORY_LABELS[cat as Category] ?? cat}
            </h3>
            <div className="grid gap-2">
              {list.map((r) => (
                <EditRow key={r.id} row={r} />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
