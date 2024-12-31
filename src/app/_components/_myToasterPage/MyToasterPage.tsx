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

function MyToasterPage() {
  const { pairedToasters, setPairedToasters } = useToasterUser()
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [printerId, setPrinterId] = useState("")

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
    <>
      {pairedToasters.length > 0 && (
        <PairedToasterContainer
          pairedToasters={pairedToasters}
          setPairedToasters={setPairedToasters}
        />
      )}
      <div className="flex flex-col h-full bg-toastWhite border-t border-[1px] border-gray-500">
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
    </>
  )
}

// const useToasterPairing = (userId: string) => {
//   const [pairedToasters, setPairedToasters] = useState<string[]>([])

//   useEffect(() => {
//     const fetchPairedToasters = async () => {
//       const paired = await getPairedToasters(userId)
//       const printerIds = paired.map((printer) => printer.printerId)
//       setPairedToasters(printerIds)
//     }

//     fetchPairedToasters()
//   }, [userId])

//   return { pairedToasters, setPairedToasters }
// }

export default MyToasterPage
