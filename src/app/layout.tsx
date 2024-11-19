import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignInButton, UserButton } from "@clerk/nextjs"

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: "Toaster",
  description: "Toasting prints since 2024",
  formatDetection: {
    telephone: false,
  },
  authors: [
    {
      name: "Bart",
    },
  ],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/Logo16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/Logo32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/Logo128.png", sizes: "128x128", type: "image/png" },
      { url: "/images/Logo256.png", sizes: "256x256", type: "image/png" },
      { url: "/images/Logo512.png", sizes: "512x512", type: "image/png" },
    ],
    // Apple Touch Icon (the one you see when you put the page on your homescreen as app)
    apple: [
      { url: "/images/Logo256AppleIcon.png", sizes: "256x256" },
      { url: "/images/Logo512AppleIcon.png", sizes: "512x512" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Toaster",
    startupImage: [
      // iPads
      // https://progressier.com/pwa-icons-and-ios-splash-screen-generator
      {
        url: "/images/splash/12.9_iPad_Pro_landscape.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/12.9_iPad_Pro_portrait.png",
        media:
          "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/images/splash/11_iPad_Pro_10.5_iPad_Pro_landscape.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/11_iPad_Pro_10.5_iPad_Pro_portrait.png",
        media:
          "(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/images/splash/10.5_iPad_Air_landscape.png",
        media:
          "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/10.5_iPad_Air_portrait.png",
        media:
          "(device-width: 820px) and (device-height: 1180px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/images/splash/10.2_iPad_landscape.png",
        media:
          "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/10.2_iPad_portrait.png",
        media:
          "(device-width: 810px) and (device-height: 1080px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/images/splash/9.7_iPad_Pro_7.9_iPad_mini_9.7_iPad_Air_landscape.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/9.7_iPad_Pro_7.9_iPad_mini_9.7_iPad_Air_portrait.png",
        media:
          "(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/images/splash/8.3_iPad_Mini_landscape.png",
        media:
          "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/8.3_iPad_Mini_portrait.png",
        media:
          "(device-width: 744px) and (device-height: 1133px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },

      // iPhones
      {
        url: "/images/splash/iPhone_16_Pro_Max_landscape.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/images/splash/iPhone_16_Pro_Max_portrait.png",
        media:
          "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/images/splash/iPhone_16_Pro_landscape.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/images/splash/iPhone_16_Pro_portrait.png",
        media:
          "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/images/splash/iPhone_14_Plus_iPhone_13_Pro_Max_iPhone_12_Pro_Max_landscape.png",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/images/splash/iPhone_14_Plus_iPhone_13_Pro_Max_iPhone_12_Pro_Max_portrait.png",
        media:
          "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/images/splash/iPhone_14_iPhone_13_Pro_iPhone_13_iPhone_12_Pro_iPhone_12_landscape.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
      },
      {
        url: "/images/splash/iPhone_14_iPhone_13_Pro_iPhone_13_iPhone_12_Pro_iPhone_12_portrait.png",
        media:
          "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
      },
      {
        url: "/images/splash/iPhone_11_iPhone_XR_landscape.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/iPhone_11_iPhone_XR_portrait.png",
        media:
          "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
      {
        url: "/images/splash/4_iPhone_SE_iPod_touch_5th_generation_and_later_landscape.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)",
      },
      {
        url: "/images/splash/4_iPhone_SE_iPod_touch_5th_generation_and_later_portrait.png",
        media:
          "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)",
      },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#d4d0c8" },
    { media: "(prefers-color-scheme: dark)", color: "#d4d0c8" },
  ],
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${ibmPlexMono.variable}`}>
          <header className="flex justify-end p-4"></header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
