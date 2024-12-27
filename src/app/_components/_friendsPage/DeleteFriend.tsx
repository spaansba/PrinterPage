import { AlertTriangle, Trash2, X } from "lucide-react"
import React, { useState } from "react"
import DeleteModal from "../_helperComponents/DeleteModal"

type DeleteFriendProps = {
  friendToDelete: string
}

function DeleteFriend({ friendToDelete }: DeleteFriendProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  return (
    <>
      <button
        type="button"
        className="ml-auto relative before:absolute before:content-[''] before:-inset-3 before:z-10"
        title="Edit Name"
        onClick={(e) => setShowDeleteModal(true)}
      >
        <Trash2 className="text-black relative z-20" size={18}></Trash2>
      </button>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleOnDeleteClick={() => {}}
        messageText={`Are you sure you want to delete ${friendToDelete}`}
        titleText="Confirm Deletion of Friend"
      />
    </>
  )
}

export default DeleteFriend
