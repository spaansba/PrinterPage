import { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Toaster",
    short_name: "Toaster",
    description: "Toasting prints since 2024",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f5f5",
    theme_color: "#f5f5f5",
    orientation: "portrait",
    id: "/",
    scope: "/",
    icons: [
      {
        src: "/images/Logo256AppleIcon.png",
        sizes: "256x256",
        type: "image/png",
      },
      {
        src: "/images/Logo512AppleIcon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
