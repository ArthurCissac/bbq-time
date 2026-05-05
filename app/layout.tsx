import type { Metadata, Viewport } from "next";
import { Inter, Bricolage_Grotesque } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
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
    <html lang="fr" className={cn(inter.variable, bricolage.variable)}>
      <body className="font-sans antialiased bbq-grain">{children}</body>
    </html>
  );
}
