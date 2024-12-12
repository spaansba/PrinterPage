import React from "react"
import ProfilePicture from "./ProfilePicture"
import UserName from "./UserName"

export default function UserInformation() {
  return (
    <div className="flex gap-2">
      <ProfilePicture />
      <div className="flex flex-col flex-1 min-w-0">
        <UserName />
      </div>
    </div>
  )
}
