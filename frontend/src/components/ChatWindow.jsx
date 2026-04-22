import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "../styles/ChatApp.css";

const ChatWindow = ({
  selectedChat,
  messages,
  onMessageSent,
  onMessageStatusChange,
  currentUserId,
//   isSyncing,
  onlineCount,
  isOtherTyping,
  socketJoinReady,
  socketJoinError,
  socketJoinLoading,
  onCreatePublicConversation,
}) => {
  return (
    <div className="chat-window">
      <ChatHeader
        selectedChat={selectedChat}
        onlineCount={onlineCount}
        isOtherTyping={isOtherTyping}
        socketJoinError={socketJoinError}
        socketJoinLoading={socketJoinLoading}
        onCreatePublicConversation={onCreatePublicConversation}
        currentUserId={currentUserId}
      />

      <MessageList messages={messages} selectedChat={selectedChat} />

      <MessageInput
        selectedChat={selectedChat}
        currentUserId={currentUserId}
        onMessageSent={onMessageSent}
        onMessageStatusChange={onMessageStatusChange}
        joinReady={socketJoinReady}
      />
    </div>
  );
};

export default ChatWindow;
