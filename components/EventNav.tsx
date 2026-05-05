"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS: Array<{ segment: string; label: string }> = [
  { segment: "items", label: "Items" },
  { segment: "qr", label: "QR Code" },
  { segment: "dashboard", label: "Dashboard" },
];

export function EventNav({ eventId }: { eventId: string }) {
  const active = useSelectedLayoutSegment();

  return (
    <nav className="flex gap-2 flex-wrap">
      {TABS.map((tab) => {
        const isActive = active === tab.segment;
        return (
          <Link key={tab.segment} href={`/event/${eventId}/${tab.segment}`}>
            <Button
              type="button"
              className={cn(
                isActive
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-white hover:bg-orange-50 text-foreground border border-input",
              )}
            >
              {tab.label}
            </Button>
          </Link>
        );
      })}
    </nav>
  );
}
