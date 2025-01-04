import React, { useRef } from "react"
import type { FriendListHook } from "../AppWindow"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { useUser } from "@clerk/nextjs"
import { friendNameSchema } from "../_editorPage/AddNewFriendForm"
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
