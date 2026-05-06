"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { joinEvent } from "@/lib/actions/guest";

const ERROR_LABELS: Record<string, string> = {
  EVENT_NOT_FOUND: "Ce BBQ n'existe pas ou a été supprimé.",
  RATE_LIMITED: "Trop d'inscriptions depuis ton réseau. Réessaie dans 1 minute.",
  VALIDATION:
    "Prénom invalide (1 à 30 caractères, sans balises HTML).",
};

export function JoinForm({ code }: { code: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    const firstName = String(data.get("firstName") ?? "").trim();
    if (!firstName) {
      setError(ERROR_LABELS.VALIDATION);
      return;
    }
    startTransition(async () => {
      try {
        await joinEvent({ code, firstName });
        // Si succès, server action throw NEXT_REDIRECT et redirige.
      } catch (err: unknown) {
        // NEXT_REDIRECT n'est PAS une vraie erreur — on doit le laisser remonter.
        const e = err as { digest?: string; message?: string };
        if (e?.digest?.startsWith("NEXT_REDIRECT")) {
          throw err;
        }
        const code = e?.message ?? "";
        setError(ERROR_LABELS[code] ?? `Erreur : ${code || "inconnue"}. Réessaie.`);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="firstName">Ton prénom</Label>
        <Input
          id="firstName"
          name="firstName"
          required
          maxLength={30}
          autoFocus
          placeholder="Arthur"
          className="text-lg h-12"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="w-full h-12 text-base bg-coal hover:bg-coal/90 text-ivory"
      >
        {pending ? "Connexion…" : "Je rejoins"}
      </Button>
    </form>
  );
}
