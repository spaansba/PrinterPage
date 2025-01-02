import Image from "next/image"
import type { Friend } from "../_editorPage/_friendSelector/FriendSelector"

type FriendProfilePictureProps = {
  pictureUrl: string | null
  altName: string
  pictureSizeInPX: number
}

function FriendProfilePicture({ pictureUrl, altName, pictureSizeInPX }: FriendProfilePictureProps) {
  return (
    <div
      className="overflow-hidden rounded-full"
      style={{ width: `${pictureSizeInPX}px`, height: `${pictureSizeInPX}px` }}
    >
      <Image
        draggable={false}
        src={pictureUrl || "/images/backupProfile.png"}
        alt={altName}
        width={pictureSizeInPX}
        height={pictureSizeInPX}
        className="object-cover w-full h-full"
      />
    </div>
  )
}

export default FriendProfilePicture
