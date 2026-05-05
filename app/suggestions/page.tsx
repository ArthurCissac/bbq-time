import Link from "next/link";
import { listSuggestions } from "@/lib/actions/suggestions";
import { SuggestionsEditor } from "@/components/SuggestionsEditor";

export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
  const rows = await listSuggestions();

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Tous les BBQ
          </Link>
          <h1 className="text-3xl font-black tracking-tight mt-1">
            ⚡ Suggestions
          </h1>
          <p className="text-sm text-muted-foreground">
            Items prêts à ajouter en 1 clic dans n'importe quel BBQ.
          </p>
        </header>
        <SuggestionsEditor rows={rows} />
      </div>
    </main>
  );
}
