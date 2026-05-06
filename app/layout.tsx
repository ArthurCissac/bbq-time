import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "Brasero — la liste de courses du BBQ",
  description: "Brasero. Crée un BBQ. Partage le QR. Vois ce que tout le monde veut.",
};

export const viewport: Viewport = {
  themeColor: "#1A1614",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={cn(inter.variable, fraunces.variable)}>
      <body className="font-sans antialiased bbq-grain min-h-screen">{children}</body>
    </html>
  );
}
