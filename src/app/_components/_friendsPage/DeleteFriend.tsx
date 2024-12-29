import { Trash2 } from "lucide-react"
import React, { useState } from "react"
import DeleteModal from "../_helperComponents/DeleteModal"
import { useUser } from "@clerk/nextjs"
import type { Friend } from "../_editorPage/_friendSelector/FriendSelector"

type DeleteFriendProps = {
  friendToDelete: Friend
  deleteFriend: (userId: string, friendToDelete: Friend) => Promise<void>
}

function DeleteFriend({ friendToDelete, deleteFriend }: DeleteFriendProps) {
  const { user } = useUser()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  if (!user) {
    return
  }

  return (
    <>
      <button
        type="button"
        className="ml-auto relative before:absolute before:content-[''] before:-inset-3 before:z-10"
        title="Delete Friend"
        onClick={() => setShowDeleteModal(true)}
      >
        <Trash2 className="text-black relative z-20" size={18}></Trash2>
      </button>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleOnDeleteClick={() => deleteFriend(user.id, friendToDelete)}
        messageText={`Are you sure you want to delete ${friendToDelete.name}`}
        titleText="Confirm Deletion of Friend"
      />
    </>
  )
}

export default DeleteFriend
