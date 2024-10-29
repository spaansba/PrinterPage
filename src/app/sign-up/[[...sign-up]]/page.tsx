"use client"
import React, { useRef } from "react"
import * as Clerk from "@clerk/elements/common"
import * as SignUp from "@clerk/elements/sign-up"
import { Mail, User, Lock } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const emailButtonRef = useRef<HTMLButtonElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      emailButtonRef.current?.click()
    }
  }

  return (
    <div className="bg-[#d4d0c8] flex items-center justify-center p-4">
      <div className="w-full max-w-md border-2 border-white shadow-[2px_2px_8px_rgba(0,0,0,0.2)]">
        {/* Window Title Bar */}
        <div className="h-8 bg-[#000080] flex items-center justify-between px-2">
          <span className="text-white text-sm font-bold">Sign Up</span>
        </div>

        {/* Sign Up Container */}
        <div className="bg-[#d4d0c8] border border-[#808080] p-6">
          <SignUp.Root>
            <SignUp.Step name="start">
              <div className="space-y-6">
                {/* Google Sign Up Button */}
                <Clerk.Connection name="google" className="w-full">
                  <button className="w-full h-10 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white flex items-center justify-center gap-2 px-4 text-sm hover:bg-[#e6e3dd]">
                    <Clerk.Icon />
                    Sign Up With Google
                  </button>
                </Clerk.Connection>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#808080]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[#d4d0c8] px-2 text-[#808080]">Or continue with</span>
                  </div>
                </div>

                {/* Username Input */}
                <div className="space-y-2">
                  <Clerk.Field name="username">
                    <Clerk.Label className="text-sm font-medium block mb-1">Username</Clerk.Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3">
                        <User size={16} className="text-[#808080]" />
                      </div>
                      <Clerk.Input className="w-full h-10 pl-9 bg-white border border-[#808080] focus:outline-none focus:ring-1 focus:ring-[#000080] text-sm" />
                    </div>
                    <Clerk.FieldError className="text-xs text-red-600 mt-1" />
                  </Clerk.Field>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Clerk.Field name="emailAddress">
                    <Clerk.Label className="text-sm font-medium block mb-1">Email</Clerk.Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3">
                        <Mail size={16} className="text-[#808080]" />
                      </div>
                      <Clerk.Input
                        className="w-full h-10 pl-9 bg-white border border-[#808080] focus:outline-none focus:ring-1 focus:ring-[#000080] text-sm"
                        onKeyDown={handleKeyDown}
                      />
                    </div>
                    <Clerk.FieldError className="text-xs text-red-600 mt-1" />
                  </Clerk.Field>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Clerk.Field name="password">
                    <Clerk.Label className="text-sm font-medium block mb-1">Password</Clerk.Label>
                    <div className="relative">
                      <div className="absolute left-3 top-3">
                        <Lock size={16} className="text-[#808080]" />
                      </div>
                      <Clerk.Input
                        type="password"
                        className="w-full h-10 pl-9 bg-white border border-[#808080] focus:outline-none focus:ring-1 focus:ring-[#000080] text-sm"
                      />
                    </div>
                    <Clerk.FieldError className="text-xs text-red-600 mt-1" />
                  </Clerk.Field>
                </div>

                {/* Submit Button */}
                <SignUp.Action submit>
                  <button
                    ref={emailButtonRef}
                    className="w-[200px] h-10 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-sm hover:bg-[#e6e3dd]"
                  >
                    Create Account
                  </button>
                </SignUp.Action>

                {/* Sign In Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-[#808080]">
                    Already have an account?{" "}
                    <Link
                      href="/sign-in"
                      className="text-[#000080] underline hover:text-[#0000FF] focus:outline-none focus:ring-1 focus:ring-[#000080]"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>
            </SignUp.Step>

            <SignUp.Step name="verifications">
              <SignUp.Strategy name="email_code">
                <div className="space-y-6">
                  <h1 className="text-lg font-bold">Check your email</h1>
                  <p className="text-sm text-[#808080]">
                    {/* We sent a code to <SignUp.SafeIdentifier /> */}
                  </p>

                  <Clerk.Field name="code">
                    <Clerk.Label className="text-sm font-medium block mb-1">Email code</Clerk.Label>
                    <Clerk.Input className="w-full h-10 bg-white border border-[#808080] focus:outline-none focus:ring-1 focus:ring-[#000080] px-3 text-sm" />
                    <Clerk.FieldError className="text-xs text-red-600 mt-1" />
                  </Clerk.Field>

                  <SignUp.Action submit>
                    <button className="w-[200px] h-10 bg-[#d4d0c8] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white text-sm hover:bg-[#e6e3dd]">
                      Verify Email
                    </button>
                  </SignUp.Action>
                </div>
              </SignUp.Strategy>
            </SignUp.Step>
          </SignUp.Root>
        </div>
      </div>
    </div>
  )
}
