"use client";

import { useRef } from "react";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";

// Flamme identique au LogoMark — charbon plein avec vide négatif
const FLAME_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' width='80' height='80'>
  <circle cx='24' cy='24' r='23' fill='#FFFFFF' stroke='#2C1810' stroke-width='1.5'/>
  <path fill='#2C1810' d='M24 8 C 29 14, 36 18, 36 27 C 36 34, 30 40, 24 40 C 18 40, 12 34, 12 27 C 12 21, 15 19, 17 16 C 18 18, 20 19, 21 16 C 22 13, 23 11, 24 8 Z'/>
  <path fill='#FFFFFF' d='M24 19 C 27 22, 29 25, 29 29 C 29 32, 27 34, 24 34 C 21 34, 19 32, 19 29 C 19 27, 21 25, 22 23 C 22 24, 23 24, 24 23 Z'/>
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
