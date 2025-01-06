import { React, useState, useEffect } from "react";
import "./detail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import smartAgri from "../../images/smart-agr.png";
import { auth, db } from "../lib/firebase";
import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "../lib/useChatStore";
import { useUserStore } from "../lib/userStore";

export default function Detail({setTheme}) {
  const { chatId, user, isCurrentUserBlocked, isRecieverBlocked, changeBlock } =
    useChatStore();
  // const currentUser = null;
  const { currentUser } = useUserStore(); // Correctly invoked as a function
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBlock = async () => {
    if (!user || !currentUser || !currentUser.id) {
      console.error("Invalid user or currentUser data");
      return;
    }

    const userDocRef = doc(db, "users", currentUser?.id);

    try {
      const docSnapshot = await getDoc(userDocRef);
      if (!docSnapshot.exists()) {
        console.error("User document does not exist in Firestore.");
        return;
      }

      console.log("Is Receiver Blocked:", isRecieverBlocked);
      await updateDoc(userDocRef, {
        blocked: isRecieverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      console.log("Block status updated successfully.");
      changeBlock(); // Ensure this updates the state correctly
    } catch (error) {
      console.error("Error on blocking user:", error);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // Toggle expanded state
  };

  const colors = ['#f5f5f5', '#ffebcd', '#d3f9d8', '#cce7ff', '#f8d7da']; // Popular colors

  const changeTheme = (color) => {
    setTheme(color); // Update theme in the parent component
    // console.log(color)
  };

  const getInitial = () => {
    // if (user?.username) return user.username.charAt(0).toUpperCase();
    if (currentUser?.username)
      return currentUser.username.charAt(0).toUpperCase();
    return "?"; // Fallback  if name is not available
  };
  return (
    <div className="detail">
      <div className="user">
        <div className="user-profile">
          <span className="profile-initial">{getInitial()}</span>
        </div>
        <h2>{currentUser.username}</h2>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing </p>
      </div>
      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat setting</span>
            <FontAwesomeIcon icon={faAngleUp} className="icon-angle-arrow" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <FontAwesomeIcon icon={faAngleUp} className="icon-angle-arrow" />
          </div>
        </div>
        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <FontAwesomeIcon icon={faAngleUp} className="icon-angle-arrow" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <div className="photoDetail">
                <img src={smartAgri} alt="" />
                <span>smart-agri.png</span>
              </div>
            </div>
          </div>
        </div>
        <div className="option">
          <div className="title" onClick={toggleExpand}>
            <span>change theams</span>
            <FontAwesomeIcon
              icon={isExpanded ? faAngleUp : faAngleDown}
              className="icon-angle-arrow"
            />
          </div>
          { isExpanded && (<div className="theme-options">
            {colors.map((color, index) => (
              <button
                key={index}
                className="theme-button"
                style={{ backgroundColor: color }}
                onClick={() => changeTheme(color)}
              ></button>
            ))}
          </div>)}
        </div>
        <button className="btn-block" onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are blocked"
            : isRecieverBlocked
            ? "User blocked"
            : "Block user"}
        </button>
        <button className="btn-block" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
}
