"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { suggestions } from "@/lib/db/schema";
import { SUGGESTIONS as DEFAULT_SUGGESTIONS, type Category } from "@/lib/suggestions";

const suggestionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(40),
  emoji: z.string().min(1).max(8),
  category: z.enum(["viande", "accompagnement", "boisson", "dessert", "autre"]),
  hasCookingPref: z.boolean(),
  defaultQty: z.coerce.number().int().min(0).max(9999),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export type SuggestionInput = z.infer<typeof suggestionSchema>;

export async function listSuggestions() {
  return db.query.suggestions.findMany({
    orderBy: (s, { asc }) => [asc(s.category), asc(s.sortOrder), asc(s.name)],
  });
}

export async function upsertSuggestion(input: SuggestionInput) {
  const data = suggestionSchema.parse(input);
  if (data.id) {
    await db
      .update(suggestions)
      .set({
        name: data.name,
        emoji: data.emoji,
        category: data.category,
        hasCookingPref: data.hasCookingPref,
        defaultQty: data.defaultQty,
        sortOrder: data.sortOrder,
      })
      .where(eq(suggestions.id, data.id));
  } else {
    await db
      .insert(suggestions)
      .values({
        name: data.name,
        emoji: data.emoji,
        category: data.category,
        hasCookingPref: data.hasCookingPref,
        defaultQty: data.defaultQty,
        sortOrder: data.sortOrder,
      })
      .onConflictDoNothing({ target: suggestions.name });
  }
  revalidatePath("/suggestions");
}

export async function deleteSuggestion(id: string) {
  await db.delete(suggestions).where(eq(suggestions.id, id));
  revalidatePath("/suggestions");
}

export async function seedDefaultSuggestions() {
  const rows = DEFAULT_SUGGESTIONS.map((s, i) => ({
    name: s.name,
    emoji: s.emoji,
    category: s.category as Category,
    hasCookingPref: s.hasCookingPref,
    defaultQty: s.defaultQty,
    sortOrder: i,
  }));
  await db.insert(suggestions).values(rows).onConflictDoNothing();
  revalidatePath("/suggestions");
}

export async function clearSuggestions() {
  await db.delete(suggestions);
  revalidatePath("/suggestions");
}
