export type Toaster = {
  id: string
  name: string
  profilePicture: string | null
  pairedAccounts?: ToasterUser[]
}

export type ToasterUser = {
  id: string
  userName: string
  profileImageUrl?: string | null
}

export type Friend = {
  printerId: string
  name: string
  lastSendMessage: string
  profilePicture: string | null
}
