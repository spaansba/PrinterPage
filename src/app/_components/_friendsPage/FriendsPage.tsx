import type { FriendListHook } from "../AppWindow"
import AddNewFriend from "../_editorPage/_friendSelector/AddNewFriend"
import FriendRow from "./FriendRow"

type FriendsPageProps = {
  friendsHook: FriendListHook
}

function FriendsPage({ friendsHook }: FriendsPageProps) {
  return (
    <>
      <div className="border-t border-[1px] border-gray-500 flex flex-col relative">
        {friendsHook.friendList.map((friend, index) => (
          <FriendRow friendsHook={friendsHook} friend={friend} key={friend.printerId} />
        ))}
        <AddNewFriend friendsHook={friendsHook} />
      </div>
    </>
  )
}

export default FriendsPage
