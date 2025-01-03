export type Toaster = {
  id: string
  name: string
  profilePicture: string | null
  pairedAccounts?: ToasterUser[]
}
type ToasterUser = {
  id: string
  userName: string
  profileImageUrl?: string | null
}
