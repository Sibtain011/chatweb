import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
  try {
    set({ isMessagesLoading: true });

    const res = await axios.get(`/api/messages/${userId}`);

    set({
      messages: Array.isArray(res.data.messages)
        ? res.data.messages
        : [],
    });

  } catch (error) {
    console.error("Error fetching messages:", error);
    set({ messages: [] });
  } finally {
    set({ isMessagesLoading: false });
  }
},
  
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
  
    // stop request if user not selected
    if (!selectedUser || !selectedUser.id) {
      toast.error("No user selected");
      return;
    }
  
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        messageData
      );
  
      set({ messages: [...messages, res.data] });
  
    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send message");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser.id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
