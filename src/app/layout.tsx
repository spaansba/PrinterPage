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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/images/Logo16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/Logo32.png", sizes: "32x32", type: "image/png" },
    ],
    // Apple Touch Icon (the one you see when you put the page on your homescreen as app)
    apple: [{ url: "/images/Logo256AppleIcon.png" }],
  },
  appleWebApp: {
    capable: true, // runs full screen mode
    startupImage: "/images/Logo512AppleIcon.png",
    statusBarStyle: "black",
    title: "Toaster", // Title for the Apple Touch Icon
  },
}
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  userScalable: false,
  maximumScale: 1,
  minimumScale: 1,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${ibmPlexMono.variable}`}>
          <header className="flex justify-end p-4">
            {/* <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "size-10 bg-[transparent]",
                    userButtonTrigger: "bg-[#EEF1DB] rounded-none hover:none",
                    userButtonPopoverCard:
                      "bg-[#EEF1DB] rounded-none border-2 border-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]",
                    userButtonPopoverFooter: "hidde n",
                    userButtonPopoverActions: "p-0",
                    userButtonPopoverMain: "rounded-none",
                    userPreviewMainIdentifier: "text-sm",
                    userPreviewSecondaryIdentifier: "text-xs text-[#808080]",
                    userButtonPopoverActionButton:
                      "w-full text-left px-4 py-1 text-sm hover:bg-[#000080] hover:text-white",
                    avatarBox: "size-10 border border-[#808080] rounded-none [&_*]:rounded-none",
                    avatarImage: "rounded-none [&_*]:rounded-none",
                    userButtonAvatarBox: "rounded-none [&_*]:rounded-none",
                    userPreviewAvatarBox: "rounded-none [&_*]:rounded-none",
                    userPreviewAvatarImage: "rounded-none",
                  },
                  variables: {
                    colorPrimary: "#000080",
                    colorText: "#000000",
                    colorTextSecondary: "#808080",
                    colorBackground: "#C8CCD4",
                  },
                }}
              />
            </SignedIn> */}
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
