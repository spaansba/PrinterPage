"use client"

import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="bg-[#d4d0c8] flex items-center justify-center p-4 min-h-screen">
      <div className="w-full max-w-md border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        {/* Window Title Bar */}
        <div className="h-8 bg-[#000080] flex items-center justify-between px-2">
          <span className="text-white text-sm font-bold">Sign In</span>
        </div>

        {/* Sign In Container */}
        <div className="bg-[#d4d0c8] border border-[#808080] p-6">
          <SignIn
            appearance={{
              elements: {
                formButtonPrimary:
                  "w-full h-10 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white flex items-center justify-center gap-2 px-4 text-sm hover:bg-[#e6e3dd]",
                footerActionLink:
                  "text-[#000080] underline hover:text-[#0000FF] focus:outline-none focus:ring-1 focus:ring-[#000080]",
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
