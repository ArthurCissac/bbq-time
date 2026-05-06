"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS: Array<{ segment: string; label: string }> = [
  { segment: "items", label: "Items" },
  { segment: "qr", label: "QR" },
  { segment: "dashboard", label: "Dashboard" },
  { segment: "me", label: "Moi" },
];

export function EventNav({ eventId }: { eventId: string }) {
  const active = useSelectedLayoutSegment();

  return (
    <nav className="inline-flex items-center bg-secondary rounded-full p-1 gap-0.5">
      {TABS.map((tab) => {
        const isActive = active === tab.segment;
        return (
          <Link
            key={tab.segment}
            href={`/event/${eventId}/${tab.segment}`}
            className={cn(
              "px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap",
              isActive
                ? "bg-coal text-ivory shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
