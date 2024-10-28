type LoadingSpinnerProps = {
  isLoading: boolean
}

export default function LoadingSpinner({ isLoading }: LoadingSpinnerProps) {
  if (!isLoading) return null
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-50">
      <div className="bg-[#d4d0c8] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-b-[#808080] border-r-[#808080] p-6 shadow-md flex flex-col items-center gap-4">
        <div className="w-6 h-12 relative animate-[flip_2s_steps(2,end)_infinite]">
          {/* Hourglass top */}
          <div
            className="absolute top-0 left-0 right-0 border-t-[6px] border-l-[3px] border-r-[3px] border-[#000000] h-[40%]"
            style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
          />
          {/* Hourglass bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 border-b-[6px] border-l-[3px] border-r-[3px] border-[#000000] h-[40%]"
            style={{ clipPath: "polygon(50% 0, 0 100%, 100% 100%)" }}
          />
        </div>
        <span className="text-sm">Please wait...</span>
      </div>
    </div>
  )
}
