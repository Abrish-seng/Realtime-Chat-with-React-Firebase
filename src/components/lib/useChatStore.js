import { create } from "zustand";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useUserStore } from "./userStore";
export const useChatStore = create((set) => ({
  chatId: null, // Default to null
  user: null,
  isCurrentUserBlocked: false,
  isRecieverBlocked: false,
  changeChat: (chatId, user) => {
    console.log("Changing chat to:", { chatId, user });

    // Get the current user from the store
    const currentUser = useUserStore.getState()?.currentUser;
    
    // Validate `currentUser` and `user`
    if (!currentUser || !user) {
      console.error("currentUser or user is undefined:", { currentUser, user });
      return set({
        chatId: null,
        user: null,
        isCurrentUserBlocked: false,
        isRecieverBlocked: false,
      });
    }

    // Ensure `blocked` properties are arrays
    const userBlockedList = Array.isArray(user.blocked) ? user.blocked : [];
    const currentUserBlockedList = Array.isArray(currentUser.blocked) ? currentUser.blocked : [];

    // Check blocking conditions
    const isCurrentUserBlocked = userBlockedList.includes(currentUser.id);
    const isRecieverBlocked = currentUserBlockedList.includes(user.id);

    if (isCurrentUserBlocked) {
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isRecieverBlocked: false,
      });
    } else if (isRecieverBlocked) {
      return set({
        chatId, // Assign the chat ID
        user: user,
        isCurrentUserBlocked: false,
        isRecieverBlocked: true,
      });
    } else {
      return set({
        chatId, // Assign the chat ID
        user,
        isCurrentUserBlocked: false,
        isRecieverBlocked: false,
      });
    }
  },
  changeBlock: () => {
    set((state) => ({
      ...state,
      isRecieverBlocked: state.isCurrentUserBlocked,
    }));
  },
}));
