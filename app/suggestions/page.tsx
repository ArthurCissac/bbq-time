import Link from "next/link";
import { listSuggestions } from "@/lib/actions/suggestions";
import { SuggestionsEditor } from "@/components/SuggestionsEditor";

export const dynamic = "force-dynamic";

export default async function SuggestionsPage() {
  const rows = await listSuggestions();

  return (
    <main className="min-h-screen p-4 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">
        <header>
          <Link
            href="/"
            className="text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground border-b border-transparent hover:border-foreground transition-colors pb-0.5"
          >
            ← Retour
          </Link>
          <h1 className="font-display-tight text-5xl font-medium leading-tight mt-3">
            Suggestions
          </h1>
          <p className="text-base text-muted-foreground mt-2 max-w-lg">
            Items prêts à ajouter en 1 clic dans n'importe quel BBQ.
          </p>
        </header>
        <hr className="bbq-divider" />
        <SuggestionsEditor rows={rows} />
      </div>
    </main>
  );
}
