import { useState } from "react"
import ToasterIdForm from "./ToasterIdForm"
import VerificationForm from "./VerificationForm"
import { checkVerificationCode } from "@/lib/queries/printerVerificationCode"

function MyToasterPage() {
  const [showVerificationForm, setShowVerificationForm] = useState(false)
  const [printerId, setPrinterId] = useState("")
  const handleVerificationSubmit = async (code: string) => {
    const result = await checkVerificationCode(printerId, code)
    console.log(result)
  }
  return (
    <div className="flex flex-col h-full bg-toastWhite border-t border-[1px] border-gray-500">
      <div className="p-4">
        <div className="mb-6">
          <h1 className="text-lg font-normal mb-4">Work in Progress</h1>
          {/* <p className="text-sm mb-4">
            Enter your toaster's unique ID to connect it to your account.
          </p> */}
        </div>
        {/* <ToasterIdForm
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
        )} */}
      </div>
    </div>
  )
}

export default MyToasterPage
