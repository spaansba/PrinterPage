import { KeyRound, X } from "lucide-react"
import React, { useState, type Dispatch, type SetStateAction } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUser } from "@clerk/nextjs"
import { incrementVerificationAttempt } from "@/lib/queries/printerVerificationCode"

const verificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 characters"),
})

type VerificationModalProps = {
  showVerificationModal: boolean
  setShowVerificationModal: Dispatch<SetStateAction<boolean>>
  handleVerificationSubmit: (code: string, userId: string) => Promise<void>
}

function VerificationModal({
  showVerificationModal,
  setShowVerificationModal,
  handleVerificationSubmit,
}: VerificationModalProps) {
  const { user } = useUser()
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<z.infer<typeof verificationSchema>>({
    resolver: zodResolver(verificationSchema),
    mode: "onSubmit",
  })

  const onSubmit = async (data: z.infer<typeof verificationSchema>) => {
    if (!user) {
      return
    }

    try {
      const attemptStatus = await incrementVerificationAttempt(user.id)
      if (attemptStatus.blocked) {
        setError("root", {
          message: `Too many attempts. Please try again after ${attemptStatus.expiresAt.toLocaleString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              hour12: false,
            }
          )}`,
        })
        return
      }
      await handleVerificationSubmit(data.code, user.id)
    } catch (error) {
      setError("root", {
        message: "Failed to verify code. Please try again.",
      })
    }
  }

  return (
    <>
      {showVerificationModal && (
        <div className="fixed inset-0 flex items-start pt-24 justify-center bg-black/50 z-50">
          <div className="bg-toastPrimary border-2  border-[#dfdfdf] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-80">
            <div className="bg-toastTertiary px-2 py-1  flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <KeyRound size={14} />
                <span className="text-sm">Enter Verification Code</span>
              </div>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="size-7 flex items-center justify-center border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">
                    Enter the 6-digit verification code send to the toaster:
                  </label>
                  <input
                    {...register("code", {
                      onChange: (e) => {
                        e.target.value = e.target.value.toUpperCase()
                      },
                    })}
                    className="w-full px-2 py-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white font-mono text-sm"
                    placeholder="XXXXXX"
                    maxLength={6}
                  />
                  <div className="text-red-600 text-sm mt-1">
                    {errors.code?.message && <p>{errors.code.message}</p>}
                    {errors.root?.message && <p>{errors.root.message}</p>}
                  </div>
                </div>

                <div className="flex justify-end gap-1 bg-toastPrimary">
                  <button
                    type="submit"
                    className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVerificationModal(false)}
                    className="h-7 px-4 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default VerificationModal
