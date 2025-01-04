export type Toaster = {
  id: string
  name: string
  profilePicture: string | null
  toastsReceived: number
  pairedAccounts?: ToasterUser[]
}

export type ToasterUser = {
  id: string
  username: string
  toastsSend: number
  profileImageUrl?: string | null
}

export type Friend = {
  printerId: string
  name: string
  lastSendMessage: string
  profilePicture: string | null
}
