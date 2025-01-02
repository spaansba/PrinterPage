import Image from "next/image"
import type { Friend } from "../_editorPage/_friendSelector/FriendSelector"

type FriendProfilePictureProps = {
  friend: Friend
  pictureSizeInPX: number
}

function FriendProfilePicture({ friend, pictureSizeInPX }: FriendProfilePictureProps) {
  return (
    <div
      className="overflow-hidden rounded-full"
      style={{ width: `${pictureSizeInPX}px`, height: `${pictureSizeInPX}px` }}
    >
      <Image
        draggable={false}
        key={friend.printerId}
        src={friend.profilePicture || "/images/Logo512BW.png"}
        alt={friend.profilePicture ? `${friend.name}'s profile picture` : "Toaster"}
        width={pictureSizeInPX}
        height={pictureSizeInPX}
        className="object-cover w-full h-full"
      />
    </div>
  )
}

export default FriendProfilePicture
