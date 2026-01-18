import React from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp } from "lucide-react";
import FriendProfilePicture from "../../_profilePicture/FriendProfilePicture";
import type { Friend } from "@/app/types/printer";

type SelectedToastersViewProps = {
  selectedFriends: Friend[];
  isDropdownOpen: boolean;
};
const maxVisibleRecipients = 5;
function SelectedToastersView({
  selectedFriends,
  isDropdownOpen,
}: SelectedToastersViewProps) {
  return (
    <>
      <div className="flex flex-wrap overflow-hidden w-[90%] gap-y-[0.4rem] gap-x-3">
        {selectedFriends.length > 0 ? (
          <>
            {selectedFriends.slice(0, maxVisibleRecipients).map((friend) => (
              <div key={friend.printerId} className="inline-flex items-center">
                <FriendProfilePicture
                  pictureUrl={friend.profilePicture}
                  altName={friend.name}
                  pictureSizeInPX={32}
                />
                <span className="ml-2 whitespace-nowrap">{friend.name}</span>
              </div>
            ))}
            {selectedFriends.length > maxVisibleRecipients && (
              <div className="inline-flex items-center">
                <Image
                  src="/images/Logo512BW.png"
                  alt="Toaster"
                  width={24}
                  height={24}
                  className="mr-2"
                />
                <span className="whitespace-nowrap text-gray-600">
                  and {selectedFriends.length - maxVisibleRecipients} more
                </span>
              </div>
            )}
          </>
        ) : (
          <span className="text-gray-500">Select toaster...</span>
        )}
      </div>
      {isDropdownOpen ? (
        <ChevronUp className="flex-shrink-0 mt-[0.3rem]" size={14} />
      ) : (
        <ChevronDown className="flex-shrink-0 mt-[0.3rem]" size={14} />
      )}
    </>
  );
}

export default SelectedToastersView;
