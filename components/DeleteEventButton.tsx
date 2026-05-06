"use client";

import { useTransition } from "react";
import { deleteEvent } from "@/lib/actions/admin";

export function DeleteEventButton({
  eventId,
  eventName,
}: {
  eventId: string;
  eventName: string;
}) {
  const [pending, startTransition] = useTransition();

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      !confirm(
        `Supprimer "${eventName}" ?\n\nTous les invités, items et commandes liés seront perdus.`,
      )
    )
      return;
    startTransition(async () => {
      await deleteEvent(eventId);
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="h-7 w-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
      aria-label={`Supprimer ${eventName}`}
      title="Supprimer"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6" />
      </svg>
    </button>
  );
}
