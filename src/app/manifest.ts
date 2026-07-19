import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "One Step Wrong",
    short_name: "One Step Wrong",
    description: "Playable digital-safety rehearsals for practicing consequential student decisions.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#101725",
    theme_color: "#57068c",
    categories: ["education"],
    icons: [
      { src: "/icon", sizes: "64x64", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
