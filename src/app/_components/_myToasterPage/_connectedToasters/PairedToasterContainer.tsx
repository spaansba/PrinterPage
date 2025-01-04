import type { Toaster } from "@/app/types/printer"
import PairedUserList from "./PairedUserList"
import ToasterInformation from "./ToasterInformation"

type PairedToasterContainerProps = {
  toaster: Toaster
}

function PairedToasterContainer({ toaster }: PairedToasterContainerProps) {
  return (
    <div className="border-b border-gray-300 p-4 bg-toastWhite">
      <div className="flex flex-col">
        <ToasterInformation toaster={toaster} />
        <PairedUserList toaster={toaster} />
      </div>
    </div>
  )
}

export default PairedToasterContainer
