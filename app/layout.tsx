import type { Metadata, Viewport } from "next";
import { Inter, Bebas_Neue } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "🔥 BBQ Time",
  description: "Organise ton BBQ — tes potes scannent, tu sais quoi acheter.",
};

export const viewport: Viewport = {
  themeColor: "#C0392B",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={cn(inter.variable, bebas.variable)}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
