import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Barbecue",
    short_name: "Barbecue",
    description:
      "Le BBQ entre amis, sans le casse-tête. Tes potes scannent, choisissent, tu vois tout.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5EFE6",
    theme_color: "#1A1614",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
