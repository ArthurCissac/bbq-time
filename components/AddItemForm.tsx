"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { upsertItem, quickAddItem } from "@/lib/actions/admin";
import {
  emojiFor,
  categoryFor,
  shouldHaveCookingPref,
  type Category,
  type Suggestion,
} from "@/lib/suggestions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmojiPicker } from "@/components/EmojiPicker";

const CATEGORY_LABELS: Record<Category, string> = {
  viande: "🥩 Viande",
  accompagnement: "🌽 Accompagnement",
  boisson: "🍺 Boisson",
  dessert: "🍰 Dessert",
  autre: "✨ Autre",
};

export function AddItemForm({
  eventId,
  existingNames,
  suggestions,
}: {
  eventId: string;
  existingNames: string[];
  suggestions: Suggestion[];
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🍖");
  const [category, setCategory] = useState<Category>("viande");
  const [hasCookingPref, setHasCookingPref] = useState(false);
  const [availableQty, setAvailableQty] = useState<string>("");
  const [description, setDescription] = useState("");
  const [pending, startTransition] = useTransition();

  const [emojiManual, setEmojiManual] = useState(false);
  const [categoryManual, setCategoryManual] = useState(false);
  const [cookingManual, setCookingManual] = useState(false);

  useEffect(() => {
    if (!emojiManual) setEmoji(emojiFor(name));
    if (!categoryManual) setCategory(categoryFor(name));
    if (!cookingManual) setHasCookingPref(shouldHaveCookingPref(name));
  }, [name, emojiManual, categoryManual, cookingManual]);

  const reset = () => {
    setName("");
    setEmoji("🍖");
    setCategory("viande");
    setHasCookingPref(false);
    setAvailableQty("");
    setDescription("");
    setEmojiManual(false);
    setCategoryManual(false);
    setCookingManual(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    startTransition(async () => {
      await upsertItem({
        eventId,
        name: name.trim(),
        emoji,
        category,
        hasCookingPref,
        availableQty: availableQty === "" ? null : Number(availableQty),
        description:
          category === "autre" && description.trim()
            ? description.trim()
            : null,
        sortOrder: 0,
      });
      reset();
    });
  };

  const addSuggestion = (s: Suggestion) => {
    startTransition(async () => {
      await quickAddItem(eventId, s);
    });
  };

  const lcExisting = new Set(existingNames.map((n) => n.toLowerCase()));
  const availableSuggestions = suggestions.filter(
    (s) => !lcExisting.has(s.name.toLowerCase()),
  );

  const grouped = availableSuggestions.reduce<Record<Category, Suggestion[]>>(
    (acc, s) => {
      (acc[s.category] ??= []).push(s);
      return acc;
    },
    {} as Record<Category, Suggestion[]>,
  );

  return (
    <div className="space-y-4">
      {availableSuggestions.length > 0 ? (
        <Card>
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-sm">
              ⚡ Suggestions (clic pour ajouter)
            </CardTitle>
            <Link
              href="/suggestions"
              className="text-xs text-red-600 hover:underline"
            >
              Modifier →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(grouped).map(([cat, list]) => (
              <div key={cat}>
                <p className="text-xs uppercase text-muted-foreground mb-1.5 font-bold tracking-wider">
                  {CATEGORY_LABELS[cat as Category]}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {list.map((s) => (
                    <Button
                      key={s.name}
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => addSuggestion(s)}
                      className="h-9 gap-1.5"
                    >
                      <span className="text-lg leading-none">{s.emoji}</span>
                      <span>{s.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1 py-0">
                        {s.defaultQty}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-2 border-orange-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">✏️ Ajouter manuellement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid gap-3 grid-cols-[80px_1fr]">
              <div className="space-y-1">
                <Label>Emoji</Label>
                <EmojiPicker
                  value={emoji}
                  onChange={(e) => {
                    setEmoji(e);
                    setEmojiManual(true);
                  }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="name">Nom</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={40}
                  placeholder="Merguez, pilons, etc."
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="category">Catégorie</Label>
                <select
                  id="category"
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
                <Label htmlFor="qty">Quantité dispo</Label>
                <Input
                  id="qty"
                  type="number"
                  min={0}
                  max={9999}
                  value={availableQty}
                  onChange={(e) => setAvailableQty(e.target.value)}
                  placeholder="ex: 20"
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

            {category === "autre" ? (
              <div className="space-y-1">
                <Label htmlFor="description">
                  Décris cet item (visible par les invités)
                </Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
                  placeholder="ex: Mes propres marinades pour les brochettes"
                />
                <p className="text-xs text-muted-foreground">
                  Optionnel — utile pour préciser ce qu'est l'item s'il sort
                  des catégories habituelles.
                </p>
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={pending || !name.trim()}
              className="w-full bg-red-600 hover:bg-red-700 gap-1.5"
            >
              {name.trim() ? (
                <>
                  Ajouter <span className="text-lg leading-none">{emoji}</span>{" "}
                  {name.trim()}
                </>
              ) : (
                "Ajouter un item…"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
