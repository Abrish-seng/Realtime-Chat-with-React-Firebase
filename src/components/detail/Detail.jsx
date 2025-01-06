import { React, useState, useEffect, useRef } from "react";
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
  onSnapshot,
} from "firebase/firestore";
import { useChatStore } from "../lib/useChatStore";
import { useUserStore } from "../lib/userStore";

export default function Detail({ setTheme }) {
  const { chatId, user, isCurrentUserBlocked, isRecieverBlocked, changeBlock } =
    useChatStore();
  // const currentUser = null;
  const { currentUser } = useUserStore(); // Correctly invoked as a function
  const [isExpanded, setIsExpanded] = useState(false);
  const [sharedPhotos, setSharedPhotos] = useState([]);
  const [isPhotosExpanded, setIsPhotosExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userSlogan, setUserSlogan] = useState("Lorem ipsum dolor sit amet consectetur adipisicing"); // Default value
  const sloganRef = useRef(null); // Ref for the contentEditable element

  // Fetch the current slogan when the component mounts
  useEffect(() => {
    const fetchSlogan = async () => {
      if (!currentUser || !currentUser.id) return;
      const userDocRef = doc(db, "users", currentUser.id);

      try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserSlogan(data.slogan || "No slogan set yet.");
        } else {
          setUserSlogan("No slogan set yet.");
        }
      } catch (error) {
        console.error("Error fetching slogan:", error);
        setUserSlogan("Error loading slogan.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlogan();
  }, [currentUser]);

  // Save the edited slogan to Firestore
  const saveSlogan = async () => {
    if (!currentUser || !currentUser.id) {
      console.error("Invalid user data");
      return;
    }

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, { slogan: userSlogan });
      console.log("Slogan updated successfully.");
    } catch (error) {
      console.error("Error updating slogan:", error);
    }
  };

  // Handle input change while preserving the cursor position
  const handleSloganChange = (event) => {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0); // Get the current cursor position
    const startOffset = range.startOffset; // Save the cursor position

    setUserSlogan(event.target.innerText); // Update the slogan

    // Use a timeout to ensure React's DOM update completes before restoring the cursor
    setTimeout(() => {
      if (sloganRef.current) {
        const textNode = sloganRef.current.firstChild;
        const newRange = document.createRange();
        newRange.setStart(textNode, startOffset);
        newRange.setEnd(textNode, startOffset);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }, 0);
  };

  // const handleBlock = async () => {
  //   if (!user || !currentUser || !currentUser.id) {
  //     console.error("Invalid user or currentUser data");
  //     return;
  //   }

  //   const userDocRef = doc(db, "users", currentUser?.id);

  //   try {
  //     const docSnapshot = await getDoc(userDocRef);
  //     if (!docSnapshot.exists()) {
  //       console.error("User document does not exist in Firestore.");
  //       return;
  //     }

  //     console.log("Is Receiver Blocked:", isRecieverBlocked);
  //     await updateDoc(userDocRef, {
  //       blocked: isRecieverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
  //     });

  //     console.log("Block status updated successfully.");
  //     changeBlock(); // Ensure this updates the state correctly
  //   } catch (error) {
  //     console.error("Error on blocking user:", error);
  //   }
  // };

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (docSnap) => {
      const data = docSnap.data();
      if (data && data.messages) {
        const images = data.messages.filter((msg) => msg.img); // Extract images
        setSharedPhotos(images);
      }
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const togglePhotosExpand = () => {
    setIsPhotosExpanded(!isPhotosExpanded); // Toggle expanded state for shared photos
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded); // Toggle expanded state
  };

  const colors = ["#f5f5f5", "#ffebcd", "#d3f9d8", "#cce7ff", "#f8d7da"]; // Popular colors

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
        <p
          ref={sloganRef}
          contentEditable={true}
          onInput={handleSloganChange}  // Capture changes to the content
          suppressContentEditableWarning={true}  // Avoid React warnings for contentEditable
        >
          {userSlogan}
        </p>
        <button onClick={saveSlogan} className="profile-btn">Save</button>
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
          <div className="title" onClick={togglePhotosExpand}>
            <span>Shared photos</span>
            <FontAwesomeIcon
              icon={isPhotosExpanded ? faAngleUp : faAngleDown}
              className="icon-angle-arrow"
            />
          </div>
          {isPhotosExpanded && ( // This will render the photos only if isPhotosExpanded is true
            <div className="photos">
              {sharedPhotos.length > 0 ? (
                sharedPhotos.map((message, index) => (
                  <div className="photoItem" key={index}>
                    <div className="photoDetail">
                      <img src={message.img} alt={`Shared Image ${index}`} />
                      <span>Image {index + 1}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p>No photos shared yet.</p>
              )}
            </div>
          )}
        </div>

        <div className="option">
          <div className="title" onClick={toggleExpand}>
            <span>change theams</span>
            <FontAwesomeIcon
              icon={isExpanded ? faAngleUp : faAngleDown}
              className="icon-angle-arrow"
            />
          </div>
          {isExpanded && (
            <div className="theme-options">
              {colors.map((color, index) => (
                <button
                  key={index}
                  className="theme-button"
                  style={{ backgroundColor: color }}
                  onClick={() => changeTheme(color)}
                ></button>
              ))}
            </div>
          )}
        </div>
        {/* <button className="btn-block" onClick={handleBlock}>
          {isCurrentUserBlocked
            ? "You are blocked"
            : isRecieverBlocked
            ? "User blocked"
            : "Block user"}
        </button> */}
        <button className="btn-block" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
}
