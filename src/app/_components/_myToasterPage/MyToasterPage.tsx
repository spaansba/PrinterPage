import { useState } from "react"
import ToasterIdForm from "./ToasterIdForm"
import VerificationForm from "./VerificationForm"
import {
  checkVerificationCode,
  createValidatedUserEntry,
  incrementVerificationAttempt,
} from "@/lib/queries/printerVerificationCode"
import type { UseFormSetError } from "react-hook-form"
import PairedToasterContainer from "./PairedToasterContainer"
import { useToasterUser } from "@/app/context/userDataContext"
import { Plus } from "lucide-react"

function MyToasterPage() {
  const { pairedToasters, setPairedToasters } = useToasterUser()
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [printerId, setPrinterId] = useState("")
  const [showFullToasterIdForm, setShowFullToasterIdForm] = useState(
    pairedToasters.length > 0 ? false : true
  )

  const handleVerificationSubmit = async (
    code: string,
    userId: string,
    setError: UseFormSetError<{
      code: string
    }>
  ) => {
    const attemptStatus = await incrementVerificationAttempt(userId)
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
    const result = await checkVerificationCode(printerId, code)
    if (!result.verified) {
      setError("root", {
        message: `${result.message} ${attemptStatus.attemptsRemaining} attempts remaining`,
      })
      return
    }
    const pairingResult = await createValidatedUserEntry(printerId, userId)
    if (!pairingResult.success) {
      setError("root", { message: pairingResult.message })
      return
    }
    setShowVerificationForm(false)
    setPairedToasters((prev) => [...prev, printerId])
  }

  return (
    <div className="border-[1px] border-gray-500 ">
      {pairedToasters.length > 0 && (
        <PairedToasterContainer
          pairedToasters={pairedToasters}
          setPairedToasters={setPairedToasters}
        />
      )}
      {showFullToasterIdForm ? (
        <div className="flex flex-col h-full bg-toastWhite border-t-[1px] border-gray-500">
          <div className="p-4">
            <div className="mb-6">
              <h1 className="text-lg font-normal mb-4">Work in Progress</h1>
              <p className="text-sm mb-4">
                Enter your toaster's unique ID to connect it to your account.
              </p>
            </div>

            <ToasterIdForm
              setShowVerificationForm={setShowVerificationForm}
              printerId={printerId}
              setPrinterId={setPrinterId}
            />

            {showVerificationForm && (
              <VerificationForm
                showVerificationModal={showVerificationForm}
                setShowVerificationModal={setShowVerificationForm}
                handleVerificationSubmit={handleVerificationSubmit}
              />
            )}
          </div>
        </div>
      ) : (
        <div className="w-full border-t-[1px] border-gray-500">
          <button
            onClick={() => setShowFullToasterIdForm(true)}
            className="w-full flex items-center justify-center gap-2 p-3 bg-toastWhite hover:bg-toastPrimaryHover text-toastTertiary border transition-colors"
            aria-label="Add new toaster"
          >
            <Plus size={20} />
            <span className="font-medium">Pair Another Toaster</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default MyToasterPage
