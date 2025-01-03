import type { Toaster } from "@/app/types/printer"
import PairedUserList from "./PairedUserList"
import ToasterInformation from "./ToasterInformation"

type PairedToasterContainerProps = {
  toaster: Toaster
}

function PairedToasterContainer({ toaster }: PairedToasterContainerProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col">
        <ToasterInformation toaster={toaster} />
        <PairedUserList toaster={toaster} />
      </div>
    </div>
  )
}

export default PairedToasterContainer
