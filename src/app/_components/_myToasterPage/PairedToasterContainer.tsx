import { Dispatch, SetStateAction } from "react"

type PairedToasterContainerProps = {
  pairedToasters: string[]
  setPairedToasters: Dispatch<SetStateAction<string[]>>
}

function PairedToasterContainer({
  pairedToasters,
  setPairedToasters,
}: PairedToasterContainerProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="text-lg font-medium mb-2">Your Connected Toasters</div>
      {pairedToasters.map((toaster) => (
        <div key={toaster} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">Toaster {toaster}</div>
              <div className="text-sm text-gray-500 mt-1">Status: Connected</div>
              <div className="text-sm text-gray-500">Last active: Just now</div>
            </div>
            {/* <button
              className="text-sm text-red-600 hover:text-red-700"
              onClick={() => {
                setPairedToasters((current) => current.filter((id) => id !== toaster))
              }}
            >
              Unpair
            </button> */}
          </div>
        </div>
      ))}
      {pairedToasters.length === 0 && (
        <div className="text-gray-500 text-sm">
          No toasters connected yet. Add your first toaster above.
        </div>
      )}
    </div>
  )
}

export default PairedToasterContainer
