import { usePWAInstall } from "react-use-pwa-install"

function AppDownloadButton() {
  const install = usePWAInstall()
  return (
    <div>
      <h1>My app</h1>
      {install && <button onClick={install}>Install</button>}
    </div>
  )
}

export default AppDownloadButton
