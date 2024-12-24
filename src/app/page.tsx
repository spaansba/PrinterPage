"use server"
import AppDownloadButton from "./_components/AppDownloadButton"
import MainWrapper from "./_components/MainWrapper"

export default async function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-2 gap-6 font-mono text-black bg-[#d4d0c8]">
      <MainWrapper></MainWrapper>

      <AppDownloadButton />
    </div>
  )
}
