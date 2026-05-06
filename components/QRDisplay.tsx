"use client";

import { useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";

const FLAME_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='80' height='80'>
  <defs>
    <linearGradient id='fl' x1='0' y1='0' x2='0' y2='1'>
      <stop offset='0' stop-color='#FFD27A'/>
      <stop offset='0.5' stop-color='#EA580C'/>
      <stop offset='1' stop-color='#7A1A0E'/>
    </linearGradient>
  </defs>
  <circle cx='16' cy='16' r='15' fill='#FFFFFF' stroke='#7A1A0E' stroke-width='2'/>
  <path fill='url(#fl)' stroke='#3D1308' stroke-width='1' stroke-linejoin='round' d='M16 5 C 18 9 22 11 22 16 C 22 20 19 23 16 23 C 13 23 10 20 11 16 C 11 13 13 12 13 9 C 14 11 15 11 16 9 Z'/>
  <path fill='#FFD27A' opacity='0.85' d='M16 11 C 17 13 19 14 19 17 C 19 19 17 20 16 20 C 14 20 13 19 14 17 C 14 15 15 14 16 13 Z'/>
</svg>`;

const flameDataUrl = `data:image/svg+xml;base64,${
  typeof window !== "undefined"
    ? btoa(FLAME_SVG)
    : Buffer.from(FLAME_SVG).toString("base64")
}`;

export function QRDisplay({ url, code }: { url: string; code: string }) {
  const hiresRef = useRef<HTMLCanvasElement>(null);

  const downloadPNG = () => {
    const canvas = hiresRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `bbq-time-qr-${code}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const copyURL = async () => {
    await navigator.clipboard.writeText(url);
  };

  return (
    <div className="space-y-4 print:space-y-2 w-full">
      <div className="flex justify-center">
        <div className="relative inline-block">
          {/* Cadre décoratif */}
          <div className="relative bg-[#FFF8EE] rounded-2xl border-[3px] border-[#2C1810] p-6 pb-5 shadow-[8px_8px_0_0_#2C1810] print:shadow-none">
            {/* Bandeau supérieur */}
            <div className="text-center mb-4">
              <p className="font-display font-medium text-4xl tracking-[-0.04em] text-[#2C1810] leading-none">
                barbecue
              </p>
              <div className="mx-auto h-px w-14 bg-[#2C1810] mt-3" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#2C1810]/70 mt-2.5 font-medium">
                Scanne pour commander
              </p>
            </div>

            {/* Le QR — entouré d'une boîte beige claire */}
            <div className="bg-white rounded-lg p-3 border-2 border-[#2C1810]">
              <QRCodeSVG
                value={url}
                size={300}
                level="H"
                marginSize={2}
                fgColor="#2C1810"
                bgColor="#FFFFFF"
                imageSettings={{
                  src: flameDataUrl,
                  width: 60,
                  height: 60,
                  excavate: true,
                }}
              />
            </div>

            {/* Bandeau inférieur */}
            <div className="text-center mt-4 space-y-1.5">
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#7A1A0E] font-bold">
                Code de secours
              </p>
              <code className="block bg-[#2C1810] text-[#FFF8EE] px-4 py-2 rounded-md font-mono text-2xl tracking-[0.3em] font-extrabold uppercase">
                {code}
              </code>
            </div>

            {/* Coins décoratifs */}
            <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-[3px] border-l-[3px] border-[#C72E1A] rounded-tl" />
            <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-[3px] border-r-[3px] border-[#C72E1A] rounded-tr" />
            <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-[3px] border-l-[3px] border-[#C72E1A] rounded-bl" />
            <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-[3px] border-r-[3px] border-[#C72E1A] rounded-br" />
          </div>
        </div>
      </div>

      {/* Canvas caché pour download haute résolution */}
      <div style={{ display: "none" }}>
        <QRCodeCanvas
          ref={hiresRef}
          value={url}
          size={1600}
          level="H"
          marginSize={4}
          fgColor="#000000"
          bgColor="#FFFFFF"
          imageSettings={{
            src: flameDataUrl,
            width: 320,
            height: 320,
            excavate: true,
          }}
        />
      </div>

      <div className="space-y-1 print:hidden">
        <p className="text-xs text-muted-foreground">URL fixe</p>
        <code className="block break-all bg-orange-50 p-2 rounded font-mono text-xs">
          {url}
        </code>
      </div>

      <div className="flex gap-2 flex-wrap print:hidden">
        <Button
          onClick={downloadPNG}
          className="bg-red-600 hover:bg-red-700"
        >
          📥 Télécharger PNG (impression 3D)
        </Button>
        <Button onClick={() => window.print()} variant="outline">
          🖨 Imprimer
        </Button>
        <Button onClick={copyURL} variant="outline">
          📋 Copier le lien
        </Button>
      </div>
    </div>
  );
}
