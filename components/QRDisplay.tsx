"use client";

import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";

export function QRDisplay({ url, code }: { url: string; code: string }) {
  return (
    <div className="space-y-4 print:space-y-2">
      <div className="bg-white p-6 rounded-lg border-4 border-red-600 inline-block print:border-2">
        <QRCodeSVG
          value={url}
          size={320}
          level="M"
          marginSize={2}
          fgColor="#2C3E50"
          bgColor="#FFFFFF"
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">URL</p>
        <code className="block break-all bg-orange-50 p-2 rounded font-mono text-xs">
          {url}
        </code>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">Code (saisie manuelle)</p>
        <code className="block bg-orange-50 p-2 rounded font-mono text-2xl tracking-widest font-bold uppercase text-center">
          {code}
        </code>
      </div>
      <div className="flex gap-2 print:hidden">
        <Button onClick={() => window.print()} variant="outline">
          🖨 Imprimer
        </Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(url);
          }}
          variant="outline"
        >
          📋 Copier le lien
        </Button>
      </div>
    </div>
  );
}
