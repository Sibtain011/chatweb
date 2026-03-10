// import { useChatStore } from "../store/useChatStore";
// import { useEffect, useRef } from "react";

// import ChatHeader from "./ChatHeader";
// import MessageInput from "./MessageInput";
// import MessageSkeleton from "./Skeletons/MessageSkeleton";
// import { useAuthStore } from "../store/useAuthStore";
// import { formatMessageTime } from "../lib/utils";

// const ChatContainer = () => {
//   const {
//     messages,
//     getMessages,
//     isMessagesLoading,
//     selectedUser,
//     subscribeToMessages,
//     unsubscribeFromMessages,
//   } = useChatStore();

//   const { authUser } = useAuthStore();
//   const messageEndRef = useRef(null);

//   // Fetch messages when user is selected
//   useEffect(() => {
//     if (!selectedUser?._id) return;

//     getMessages(selectedUser._id);

//     subscribeToMessages();

//     return () => unsubscribeFromMessages();
//   }, [selectedUser?._id]);

//   // Auto scroll to last message
//   useEffect(() => {
//     if (messageEndRef.current) {
//       messageEndRef.current.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [messages]);

//   // Loading skeleton
//   if (isMessagesLoading) {
//     return (
//       <div className="flex-1 flex flex-col overflow-auto">
//         <ChatHeader />
//         <MessageSkeleton />
//         <MessageInput />
//       </div>
//     );
//   }

//   // If no user selected
//   if (!selectedUser) {
//     return (
//       <div className="flex-1 flex items-center justify-center text-gray-400">
//         Select a user to start chatting
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 flex flex-col overflow-auto">
//       <ChatHeader />

//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {(Array.isArray(messages) && messages || []).map((message) => (
//           <div
//             key={message._id}
//             className={`chat ${
//               message.senderId === authUser._id ? "chat-end" : "chat-start"
//             }`}
//           >
//             {/* Avatar */}
//             <div className="chat-image avatar">
//               <div className="size-10 rounded-full border">
//                 <img
//                   src={
//                     message.senderId === authUser._id
//                       ? authUser.profilePic || "/avatar.png"
//                       : selectedUser.profilePic || "/avatar.png"
//                   }
//                   alt="profile"
//                 />
//               </div>
//             </div>

//             {/* Time */}
//             <div className="chat-header mb-1">
//               <time className="text-xs opacity-50 ml-1">
//                 {formatMessageTime(message.createdAt)}
//               </time>
//             </div>

//             {/* Message */}
//             <div className="chat-bubble flex flex-col">
//               {message.image && (
//                 <img
//                   src={message.image}
//                   alt="attachment"
//                   className="sm:max-w-[200px] rounded-md mb-2"
//                 />
//               )}

//               {message.text && <p>{message.text}</p>}
//             </div>

//             {/* Scroll reference */}
//             <div ref={messageEndRef}></div>
//           </div>
//         ))}
//       </div>

//       <MessageInput />
//     </div>
//   );
// };

// export default ChatContainer;
