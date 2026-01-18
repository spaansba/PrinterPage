import DeleteModal from "@/app/_components/_helperComponents/DeleteModal";
import { useEditorContext } from "@/app/context/editorContext";
import { Trash2 } from "lucide-react";
import React, { useState } from "react";

function DeleteMessageButton() {
  const { editor } = useEditorContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  function clearEditor() {
    editor!.chain().focus().clearContent().run();
    setShowDeleteModal(false);
  }
  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="ml-1">
        <button
          onMouseDown={() => {
            if (editor.state.selection.from > 1) {
              setShowDeleteModal(true);
            }
          }}
          className="size-7 flex items-center justify-center bg-toastPrimary border border-transparent hover:border-t-white hover:border-l-white hover:border-b-[#808080] hover:border-r-[#808080]"
        >
          <Trash2 size={15} />
        </button>
      </div>
      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        handleOnDeleteClick={clearEditor}
        messageText="Confirm Delete"
        titleText="Are you sure you want to delete the message?"
      />
    </>
  );
}

export default DeleteMessageButton;
