"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function DateField({
  id = "eventDate",
  name = "eventDate",
  label = "Date",
}: {
  id?: string;
  name?: string;
  label?: string;
}) {
  const setToday = () => {
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el) return;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const value = `${yyyy}-${mm}-${dd}`;
    const setter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input id={id} name={name} type="date" className="flex-1" />
        <Button
          type="button"
          variant="outline"
          onClick={setToday}
          className="shrink-0"
        >
          Aujourd'hui
        </Button>
      </div>
    </div>
  );
}
