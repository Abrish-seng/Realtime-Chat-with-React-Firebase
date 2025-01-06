import React, { useEffect, useRef, useState } from "react";
import "./chat.css";
import avatar1 from "../../images/avatar1.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCamera,
  faImage,
  faInfo,
  faMicrophone,
  faSmileBeam,
  faVideoCamera,
  faVolumeControlPhone,
} from "@fortawesome/free-solid-svg-icons";
import EmojiPicker from "emoji-picker-react";
import smartAgri from "../../images/smart-agr.png";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "../lib/firebase";
import { useChatStore } from "../lib/useChatStore";
import { useUserStore } from "../lib/userStore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function Chat() {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const [img, setImg] = useState({ file: null, url: "" });
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const [audioBlob, setAudioBlob] = useState(null);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };
  console.log(text);
  const endRef = useRef(null);
  useEffect(() => {
    useRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  useEffect(() => {
    if (!chatId) {
      console.error("Chat ID is undefined or null.");
      return;
    }

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      if (!res.exists()) {
        console.error("Chat document does not exist for ID:", chatId);
        return;
      }
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleImg = (e) => {
    if (e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg({
          file: e.target.files[0],
          url: reader.result, // Base64 string
        });
      };
      reader.readAsDataURL(e.target.files[0]); // Convert to base64
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      const chunks = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(audioBlob);
      };

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop microphone recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };


  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const context = canvas.getContext("2d");

      // Capture image from video stream
      setTimeout(() => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg");
        setImg({ file: null, url: base64Image }); // Set the Base64 image
        stream.getTracks().forEach((track) => track.stop());
      }, 1000); // 1-second delay to allow the camera to initialize
    } catch (error) {
      console.error("Error capturing image:", error);
    }
  };

  const handleSend = async () => {
    if (!text && !img.file && !audioBlob) return;

    // if (!chatId || !currentUser?.id || !user?.id) {
    //   console.error("Chat ID or user data is missing.",{
    //     chatId,
    //     currentUser,
    //     user,
    //   });
    //   return;
    // }
    let audioUrl = null;

    try {
      // if (img.file) {
      //   const storageRef = ref(storage, `chatImages/${Date.now()}-${img.file.name}`);
      //   const uploadResult = await uploadBytes(storageRef, img.file);
      //   imgUrl = await getDownloadURL(uploadResult.ref);
      // }

      if (audioBlob) {
        const audioRef = ref(storage, `chatAudio/${Date.now()}.webm`);
        const audioUpload = await uploadBytes(audioRef, audioBlob);
        audioUrl = await getDownloadURL(audioUpload.ref);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
          ...(img.url && { img: img.url }),
          ...(audioUrl && { audio: audioUrl }),
        }),
      });

      const userIds = [currentUser?.id, user?.id].filter(Boolean);
      userIds.forEach(async (id) => {
        const userChatRef = doc(db, "userChats", id);
        const userChatSnapshot = await getDoc(userChatRef);

        if (userChatSnapshot.exists()) {
          const userChatsData = userChatSnapshot.data();

          if (!userChatsData.chats || !Array.isArray(userChatsData.chats)) {
            console.error(`Invalid chats data for user ${id}:`, userChatsData);
            return;
          }

          // Find the chat index
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          if (chatIndex === -1) {
            console.warn(`Chat ID ${chatId} not found for user ${id}`);
            return;
          }

          userChatsData.chats[chatIndex] = {
            ...userChatsData.chats[chatIndex],
            lastMessage: text,
            isSeen: id === currentUser.id,
            updatedAt: Date.now(),
          };

          await updateDoc(userChatRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (error) {
      console.error("Error in handleSend:", error);
    }
    setImg({
      file: null,
      url: "",
    });
    setText("");
    setImg("");
  };

  const getInitial = () => {
    if (user?.username) return user.username.charAt(0).toUpperCase();
    if (currentUser?.username) return currentUser.username.charAt(0).toUpperCase();
    return '?'; // Fallback if name is not available
  };
  return (
    <div className="chat">
      <div className="top">
        <div className="user">
        <div className="user-profile">
          <span className="profile-initial">{getInitial()}</span>
        </div>
          <div>
            <span>{user?.username}</span>
            <p>hello abrish what is news????</p>
          </div>
        </div>
        <div className="icons">
          <FontAwesomeIcon icon={faVolumeControlPhone} className="icon-items" />
          <FontAwesomeIcon icon={faVideoCamera} className="icon-items" />
          <FontAwesomeIcon icon={faInfo} className="icon-items" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => {
          return (
            <div
              className={`message ${
                message.senderId === currentUser.id ? "own" : ""
              }`}
              key={message?.createdAt}
            >
              <div className="text">
                {message.img && <img src={message.img} alt="" className="" />}
                {message.audio && (
                <audio controls>
                  <source src={message.audio} type="audio/webm" />
                </audio>
              )}

                <p> {message.text}</p>
                {/* <span>3 minutes ago</span> */}
              </div>
            </div>
          );
        })}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <FontAwesomeIcon icon={faImage} className="icon-items" />
          </label>
          <input
            type="file"
            id="file"
            style={{ display: "none" }}
            onChange={handleImg}
          />
          <FontAwesomeIcon
            icon={faCamera}
            className="icon-items"
            onClick={handleCameraCapture}
          />
          <FontAwesomeIcon
            icon={faMicrophone}
            className="icon-items"
            onClick={recording ? stopRecording : startRecording}
            style={{ color: recording ? "red" : "inherit" }}
          />
          
        </div>
        <input
          type="text"
          placeholder="write here a message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="btn-emoji">
          <div>
            <FontAwesomeIcon
              icon={faSmileBeam}
              className="emoji"
              onClick={() => setOpen((prev) => !prev)}
            />
            <EmojiPicker
              open={open}
              onEmojiClick={handleEmoji}
              className="picker"
            />
          </div>
          <button className="send-btn" onClick={handleSend}>
            send
          </button>
        </div>
      </div>
    </div>
  );
}
