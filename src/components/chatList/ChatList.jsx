import {
  faMinusCircle,
  faPlusCircle,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import avatar2 from "../../images/avater2.png";
import "./chatlist.css";
import AddUser from "./AddUser";
import { useUserStore } from "../lib/userStore";
import { onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useChatStore } from "../lib/useChatStore";

export default function ChatList() {
  const [addMode, setAddMode] = useState(false);
  const [chats, setChats] = useState([]);
  const { currentUser } = useUserStore();
  const {chatId, changeChat, user} = useChatStore()

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userChats", currentUser.id),
      async (res) => {
        const items = res.data().chats; // Ensure `items` is an array

        const promises = items.map(async (item) => {
          // if (!item.reciverId) {
          //   console.error("reciverId is missing in item:", item); // Debugging
          //   return null; // Skip invalid entries
          // }

          const userDocRef = doc(db, "users", item.receiverId); // Corrected `item.reciverId`
          const userDocSnap = await getDoc(userDocRef);

          // if (!userDocSnap.exists()) {
          //   console.warn(`No user found for reciverId: ${item.receivedId}`);
          //   return null; // Skip if user does not exist
          // }

          const user = userDocSnap.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);

        // Filter out any null results from invalid entries
        setChats(
          chatData
            .filter((chat) => chat !== null)
            .sort((a, b) => b.updatedAt - a.updatedAt)
        );
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  // handle select
  const handleSelect = (chat) => {
    console.log("Selected chat:", chat); // Debug chat object
    useChatStore.getState().changeChat(chat.chatId, chat.user);
  };

  const getInitial = (u) => {
    if (u?.username) return u.username.charAt(0).toUpperCase();
    console.log(user)
    // if (currentUser?.username) return currentUser.username.charAt(0).toUpperCase();

    return '?'; // Fallback if name is not available
  };

  return (
    <div className="chatlist">
      <div className="search">
        <div className="search-bar">
          <FontAwesomeIcon icon={faSearch} />
          <input type="text" placeholder="Search" className="search-text" />
        </div>
        <FontAwesomeIcon
          icon={addMode ? faMinusCircle : faPlusCircle}
          onClick={() => setAddMode((prev) => !prev)}
          className="add-new-chat"
        />
      </div>
      
      <div className="list-items">
        {chats.length > 0 ? (
          chats.map((chat) => (
            <div key={chat.chatId} className="list-item" onClick={() => handleSelect(chat) }
              style={{backgroundColor: chat?.isSeen ? "transparent" : "rgb(236, 225, 225)"}}>
              <div className="user-profile">
                  <span className="profile-initial">{getInitial(chat.user)}</span>
              </div>
              <div className="items">
                <h4>{chat.user?.username || "Unknown User"}</h4>
                <p>{chat.lastMessage || "No message available"}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-chats">No chats available</p>
        )}
      </div>
      {addMode && <AddUser />}
    </div>
  );
}
