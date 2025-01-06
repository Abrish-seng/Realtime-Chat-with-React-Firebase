import React, { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import {db } from "../lib/firebase"
import { doc, getDoc, setDoc } from "firebase/firestore";
import { storage } from "firebase/storage";
import "./login.css";
import { toast } from "react-toastify";
import { useUserStore } from "../lib/userStore";

export default function Login() {
  const [loading, setLoading] = useState(false)
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);
  

  const handleRegister = async (e) => {
    e.preventDefault();
  
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
  
    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
      // Firebase automatically generates a unique UID
      const { uid } = userCredential.user;
  
      console.log("User created with UID:", uid);
  
      // Save user data in Firestore using UID as the document ID
      await setDoc(doc(db, "users", uid), {
        username,
        email,
        uid, // Store UID for reference if needed
      });
  
      // Initialize user's chat data
      await setDoc(doc(db, "userChats", uid), {
        chats: [],
      });
      await signOut(auth)
  
      toast.success("You registered successfully!");
    } catch (error) {
      console.error("Error creating user:", error.message);
      toast.error("Registration failed. Please try another email.");
    }
  };
  
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true)
    const formData = new FormData(e.target);
    const {email, password} = Object.fromEntries(formData)

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User signed in:", userCredential.user);
      toast.success("you logged in successfully")
      // Handle successful login (e.g., redirect to another page)
      await fetchUserInfo(userCredential.user.uid);
      
    } catch (error) {
      console.error("Error signing in:", error.message);
      // Handle errors (e.g., display error message to the user)
    } finally{
      setLoading(false)
    }
  };
  return (
    <div className="login">
      <div className="item">
        <h2>Welcome back</h2>
        <form action="" onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email" />
          <input type="text" placeholder="password" name="password" />
          <button className="login" disabled ={loading}>{loading ? "Loading" : "Sign In"}</button>
        </form>
      </div>
      <div className="separeter"></div>
      <div className="item">
        <h2>Create an Account</h2>
        <form action="" onSubmit={handleRegister}>
          <input type="text" placeholder="Username" name="username" />
          <input type="text" placeholder="Email" name="email" />
          <input type="text" placeholder="password" name="password" />
          <button className="login" disabled = {loading}>{loading ? "Loading" : "Sign Up"}</button>
        </form>
      </div>
    </div>
  );
}
