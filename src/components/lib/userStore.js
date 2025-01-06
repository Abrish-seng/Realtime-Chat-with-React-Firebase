import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
export const useUserStore = create((set) => ({
  currentUser: null, // Default to null
  isLoading: true,
  fetchUserInfo: async (uid) => {
    if (!uid) {
      console.error("fetchUserInfo: No UID provided");
      set({ currentUser: null, isLoading: false });
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({
          currentUser: { ...docSnap.data(), id: uid },
          isLoading: false,
        });
      } else {
        console.warn("User document not found for UID:", uid);
        set({
          currentUser: null,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error("fetchUserInfo: Error fetching user info", error);
      set({
        currentUser: null,
        isLoading: false,
      });
    }
  },
}));
