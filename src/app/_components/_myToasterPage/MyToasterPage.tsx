import { useForm } from "react-hook-form"
import { z } from "zod"
import { printerIdSchema } from "../_editorPage/AddNewFriendForm"
import { zodResolver } from "@hookform/resolvers/zod"
import { useUser } from "@clerk/nextjs"
import { checkIfPrinterExists } from "@/lib/queries"
import { createVerificationCode } from "@/lib/queries/printerVerificationCode"
import { randomBytes } from "crypto"

function MyToasterPage() {
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

  function createCode(): string {
    const bytes = randomBytes(Math.ceil(6 / 2))
    return bytes.toString("hex").slice(0, 6).toUpperCase()
  }

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
      const x = await createVerificationCode(data.printerId, createCode())
      console.log(x)
    } catch (error) {
      setErrorNew("root", {
        message: "Failed to add toaster. Please try again.",
      })
      console.error(error)
    }
  }
  return (
    <div className="flex flex-col h-full bg-toastWhite border-t border-[1px] border-gray-500">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-lg font-normal mb-4">Pair Toaster</h1>
          <p className="text-sm mb-4">
            Enter your toaster's unique ID to connect it to your account.
          </p>
        </div>

        <form onSubmit={handleSubmitNew(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Your Toaster ID:</label>
            <input
              {...registerNew("printerId", {
                onChange: (e) => {
                  e.target.value = e.target.value.toLowerCase()
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
      </div>
    </div>
  )
}

export default MyToasterPage
