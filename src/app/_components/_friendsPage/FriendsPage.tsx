import type { FriendListHook } from "../AppWindow";
import AddNewFriend from "../_editorPage/_friendSelector/AddNewFriend";
import PageBorderDiv from "../_helperComponents/PageBorderDiv";
import FriendRow from "./FriendRow";

type FriendsPageProps = {
  friendsHook: FriendListHook;
};

function FriendsPage({ friendsHook }: FriendsPageProps) {
  return (
    <PageBorderDiv>
      {friendsHook.friendList.map((friend) => (
        <FriendRow
          friendsHook={friendsHook}
          friend={friend}
          key={friend.printerId}
        />
      ))}
      <AddNewFriend friendsHook={friendsHook} />
    </PageBorderDiv>
  );
}

export default FriendsPage;
