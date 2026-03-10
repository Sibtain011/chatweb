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

  // Get all users
  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  // Get messages between users
  getMessages: async (userId) => {
    try {
      set({ isMessagesLoading: true });

      const res = await axiosInstance.get(`/messages/${userId}`);

      set({
        messages: Array.isArray(res.data)
          ? res.data
          : res.data.messages || [],
      });

    } catch (error) {
      console.error("Error fetching messages:", error);
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  // Send message
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser || !selectedUser._id) {
      toast.error("No user selected");
      return;
    }

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      set({
        messages: [...messages, res.data],
      });

    } catch (error) {
      toast.error(error?.response?.data?.error || "Failed to send message");
    }
  },

  // Socket subscription
  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageFromSelectedUser =
        newMessage.senderId === selectedUser._id;

      if (!isMessageFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  // Stop listening socket
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // Select chat user
  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
