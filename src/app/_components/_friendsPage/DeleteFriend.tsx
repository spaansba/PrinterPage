import React, { useState } from "react";
import DeleteModal from "../_helperComponents/DeleteModal";
import { useUser } from "@clerk/nextjs";
import type { Friend } from "@/app/types/printer";

type DeleteFriendProps = {
  friendToDelete: Friend;
  deleteFriend: (userId: string, friendToDelete: Friend) => Promise<void>;
};

function DeleteFriend({ friendToDelete, deleteFriend }: DeleteFriendProps) {
  const { user } = useUser();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  if (!user) {
    return;
  }

  return (
    <>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleOnDeleteClick={() => deleteFriend(user.id, friendToDelete)}
        messageText={`Are you sure you want to delete ${friendToDelete.name}`}
        titleText="Confirm Deletion of Friend"
      />
    </>
  );
}

export default DeleteFriend;
