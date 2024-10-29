import type { Metadata } from "next"
import localFont from "next/font/local"
import { IBM_Plex_Mono } from "next/font/google"
import "./globals.css"
import { ClerkProvider, SignedIn, SignedOut, SignIn, SignInButton, UserButton } from "@clerk/nextjs"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-IBM-Plex_Mono",
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

// Add these styles to your globals.css
const globalStyles = `
  .cl-userButtonTrigger:hover,
  .cl-userButtonTrigger:focus,
  .cl-userButtonTrigger:active {
    background-color: #EEF1DB !important;
    transform: none !important;
    filter: none !important;
  }
`

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexMono.variable}`}>
          <header className="flex justify-end p-4">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "size-10 bg-[transparent]",
                    userButtonTrigger: "bg-[#EEF1DB] rounded-none hover:none",
                    userButtonPopoverCard:
                      "bg-[#EEF1DB] rounded-none border-2 border-[#808080] shadow-[2px_2px_8px_rgba(0,0,0,0.2)]",
                    userButtonPopoverFooter: "hidden",
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
            </SignedIn>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
