import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { AddItemForm } from "@/components/AddItemForm";
import { ItemsList } from "@/components/ItemsList";
import { listSuggestions } from "@/lib/actions/suggestions";
import type { Category } from "@/lib/suggestions";

export default async function ItemsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const [eventItems, suggestionRows] = await Promise.all([
    db.query.items.findMany({
      where: eq(items.eventId, eventId),
      orderBy: (i, { asc }) => [asc(i.sortOrder), asc(i.name)],
    }),
    listSuggestions(),
  ]);

  const suggestions = suggestionRows.map((s) => ({
    name: s.name,
    emoji: s.emoji,
    category: s.category as Category,
    hasCookingPref: s.hasCookingPref,
    defaultQty: s.defaultQty,
  }));

  return (
    <div className="space-y-6">
      <AddItemForm
        eventId={eventId}
        existingNames={eventItems.map((i) => i.name)}
        suggestions={suggestions}
      />

      <section className="space-y-2">
        <h2 className="text-xl font-bold">
          Items du BBQ ({eventItems.length})
        </h2>
        <ItemsList items={eventItems} eventId={eventId} />
      </section>
    </div>
  );
}
