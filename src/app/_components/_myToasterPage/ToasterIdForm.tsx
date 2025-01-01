import { useForm } from "react-hook-form"
import { z } from "zod"
import { printerIdSchema } from "../_editorPage/AddNewFriendForm"
import { zodResolver } from "@hookform/resolvers/zod"
import { checkIfPrinterExists } from "@/lib/queries"
import { checkIfAlreadyPaired, sendVerificationCode } from "@/lib/queries/printerVerificationCode"
import { useUser } from "@clerk/nextjs"
import type { Dispatch, SetStateAction } from "react"

type ToasterIdFormProps = {
  setShowVerificationForm: Dispatch<SetStateAction<boolean>>
  printerId: string
  setPrinterId: Dispatch<SetStateAction<string>>
}

function ToasterIdForm({ setShowVerificationForm, printerId, setPrinterId }: ToasterIdFormProps) {
  const { user } = useUser()
  const {
    register: registerNew,
    handleSubmit: handleSubmitNew,
    formState: { errors: errorsNew },
    setError: setErrorNew,
  } = useForm<z.infer<typeof printerIdSchema>>({
    resolver: zodResolver(
      // Extract just the printerId part of the schema
      z.object({ printerId: printerIdSchema.shape.printerId })
    ),
    mode: "onSubmit",
  })

  async function handleFormSubmit(data: z.infer<typeof printerIdSchema>) {
    if (!user) {
      setErrorNew("root", { message: "User Doesnt Exist" })
      return
    }
    try {
      const printerIdExists = await checkIfPrinterExists(data.printerId)

      if (!printerIdExists) {
        setErrorNew("root", { message: "Toaster ID doesn't exist" })
        return
      }
      const pairedStatus = await checkIfAlreadyPaired(data.printerId, user.id)
      if (pairedStatus.length > 0) {
        const date = new Date(pairedStatus[0].createdAt)
        const formattedDate = date.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })

        setErrorNew("root", {
          message: `Toaster was already paired to your account on ${formattedDate}`,
        })
        return
      }
      const verficiationCode = await sendVerificationCode(data.printerId)
      console.log(verficiationCode)
      if (!verficiationCode.success) {
        setErrorNew("root", {
          message: verficiationCode.message,
        })
        return
      }
      setShowVerificationForm(true)
    } catch (error) {
      setErrorNew("root", {
        message: "Failed to add toaster. Please try again.",
      })
      console.error(error)
    }
  }
  return (
    <>
      <form onSubmit={handleSubmitNew(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm mb-2">Your Toaster ID:</label>
          <input
            {...registerNew("printerId", {
              onChange: (e) => {
                const value = e.target.value.toLowerCase()
                e.target.value = value
                setPrinterId(value) // Update printerId state on change
              },
            })}
            id="printerId"
            className="w-full px-2 py-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white font-mono text-sm"
            placeholder="xxxxxxxxxx"
          />
          <div className="text-red-600 pt-1">
            {errorsNew.printerId?.message && <p>{errorsNew.printerId.message}</p>}
            {errorsNew.root?.message && <p>{errorsNew.root?.message}</p>}
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-1 bg-toastPrimary border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080] text-sm hover:bg-[#e6e3de] active:border-t-[#808080] active:border-l-[#808080] active:border-b-white active:border-r-white"
          >
            Pair Toaster
          </button>
        </div>
      </form>
    </>
  )
}

export default ToasterIdForm
