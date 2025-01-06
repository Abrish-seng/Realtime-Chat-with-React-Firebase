import React, { useState } from "react";
import "./addUser.css";
import avater2 from "../../images/avater2.png";
import { useUserStore } from "../lib/userStore";
import {
  arrayUnion,
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
export default function AddUser() {
  const { currentUser } = useUserStore();
  const [user, setUser] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
  
    // console.log("Searching for username:", username);
  
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0].data();
        // console.log("Found user:", foundUser);
        setUser({ ...foundUser, id: querySnapshot.docs[0].id });
      } else {
        console.log("No matching user found");
        setUser(null); // Reset user state if not found
      }
    } catch (err) {
      console.error("Error searching for user:", err);
    }
  };
  

  const handleAdd = async () => {
    if (!user || !user.id) {
      console.error("Recipient user ID is invalid. User object:", user);
      alert("User ID is invalid. Please search and select a valid user.");
      return;
    }
  
    if (!currentUser || !currentUser.id) {
      console.error("Current user ID is invalid. Current user object:", currentUser);
      alert("Current user ID is invalid. Please log in.");
      return;
    }
  
    try {
      const chatRef = collection(db, "chats");
      const userChatsRef = collection(db, "userChats");
  
      // Create a new chat document
      const newChatRef = doc(chatRef); // Generates a new document with an auto-generated ID
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });
  
      // Prepare chat object
      await updateDoc(doc(userChatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id, // Ensure this is correct
          updatedAt: Date.now(),
        }),
      });
      
      await updateDoc(doc(userChatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id, // Ensure this is correct
          updatedAt: Date.now(),
        }),
      });
      
      console.log(newChatRef.id)
      alert("User added successfully!");
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };
  
  
  return (
    <div className="adduser">
      <div className="detail">
        <form action="" onSubmit={handleSearch}>
          <input type="text" name="username" />
          <button type="submit">Search</button>
        </form>
      </div>
      {user && (
        <div className="userlist">
          <img src={user.avatar || avater2} alt="" />
          <span>{user.username}</span>
          <div className="list-added-user">
            <button className="btn-adduser" onClick={handleAdd}>Add user</button>
          </div>
        </div>
      )}
    </div>
  );
}
