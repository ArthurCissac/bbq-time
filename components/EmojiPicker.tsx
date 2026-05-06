"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMOJI_GROUPS: Array<{ label: string; emojis: string[] }> = [
  {
    label: "🥩 Viandes",
    emojis: [
      "🍖", "🥩", "🍗", "🌭", "🥓", "🍔", "🍢", "🥚", "🍳",
      "🦆", "🐑", "🐔", "🐖",
    ],
  },
  {
    label: "🦐 Mer",
    emojis: ["🦐", "🦞", "🦀", "🐟", "🐠", "🐙", "🍤", "🍣", "🍙"],
  },
  {
    label: "🥗 Accompagnements",
    emojis: [
      "🥗", "🌽", "🥒", "🍅", "🍆", "🫑", "🥦", "🥬", "🍄", "🥔", "🍠",
      "🥕", "🧄", "🧅", "🌶️", "🥑", "🫒", "🌿", "🌱",
    ],
  },
  {
    label: "🥖 Pain & Féculents",
    emojis: ["🥖", "🥐", "🍞", "🥯", "🍕", "🍝", "🍚", "🍜", "🍛", "🌯", "🌮"],
  },
  {
    label: "🧀 Fromages",
    emojis: ["🧀"],
  },
  {
    label: "🍺 Boissons",
    emojis: [
      "🍺", "🍻", "🍷", "🥂", "🍾", "🥃", "🍹", "🍸", "🥤", "🧃", "🧉",
      "☕", "🍵", "💧", "🥛", "🧋",
    ],
  },
  {
    label: "🍰 Desserts",
    emojis: [
      "🍦", "🍧", "🍨", "🍰", "🎂", "🥧", "🧁", "🍪", "🍩", "🍫",
      "🍬", "🍭", "🍮", "🍯",
    ],
  },
  {
    label: "🍓 Fruits",
    emojis: [
      "🍓", "🍎", "🍌", "🍇", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝",
      "🍉", "🍈", "🍊", "🍋", "🍐", "🍏",
    ],
  },
  {
    label: "🥨 Apéro",
    emojis: ["🍿", "🥜", "🌰", "🥨", "🥪", "🍢"],
  },
  {
    label: "✨ Ambiance",
    emojis: [
      "🔥", "✨", "🎉", "🎊", "🎈", "🥳", "🍴", "🍽️", "🧂", "🌶️",
      "❤️", "💛", "🎁", "⭐", "💫",
    ],
  },
];

export function EmojiPicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (emoji: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const allEmojis = EMOJI_GROUPS.flatMap((g) =>
    g.emojis.map((e) => ({ emoji: e, group: g.label })),
  );

  const filtered = search.trim()
    ? allEmojis.filter((e) =>
        e.group.toLowerCase().includes(search.toLowerCase().trim()),
      )
    : null;

  return (
    <div className={cn("relative", className)}>
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen((o) => !o)}
        className="w-full h-11 text-2xl"
        aria-label="Choisir un emoji"
      >
        {value || "🍖"}
      </Button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute z-50 mt-1 w-[min(92vw,380px)] left-0 rounded-lg border-2 border-orange-200 bg-card shadow-xl p-2 max-h-[60vh] overflow-y-auto">
            <Input
              placeholder="Filtrer par catégorie…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 h-8 text-sm"
            />
            {(filtered ?? null) ? (
              <div className="grid grid-cols-8 gap-1">
                {filtered!.map((e, i) => (
                  <button
                    key={`${e.emoji}-${i}`}
                    type="button"
                    onClick={() => {
                      onChange(e.emoji);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={cn(
                      "h-9 w-9 text-xl rounded hover:bg-orange-100 flex items-center justify-center",
                      value === e.emoji ? "ring-2 ring-red-500 bg-red-50" : "",
                    )}
                  >
                    {e.emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {EMOJI_GROUPS.map((g) => (
                  <div key={g.label}>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">
                      {g.label}
                    </p>
                    <div className="grid grid-cols-8 gap-1">
                      {g.emojis.map((e, i) => (
                        <button
                          key={`${e}-${i}`}
                          type="button"
                          onClick={() => {
                            onChange(e);
                            setOpen(false);
                          }}
                          className={cn(
                            "h-9 w-9 text-xl rounded hover:bg-orange-100 flex items-center justify-center",
                            value === e
                              ? "ring-2 ring-red-500 bg-red-50"
                              : "",
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
