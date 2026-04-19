import React from "react";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatArea = ({
  selectedChat,
  messages,
  onMessageSent,
  onMessageStatusChange,
  currentUserId,
  isSyncing,
  onlineCount,
  isOtherTyping,
  onLogout,
  socketJoinReady,
  socketJoinError,
  socketJoinLoading,
  onCreatePublicConversation,
}) => {
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-2xl">
      {/* Header */}
      <ChatHeader
        selectedChat={selectedChat}
        onlineCount={onlineCount}
        isOtherTyping={isOtherTyping}
        socketJoinError={socketJoinError}
        socketJoinLoading={socketJoinLoading}
        onCreatePublicConversation={onCreatePublicConversation}
      />

      {/* Messages */}
      <MessageList messages={messages} />

      {/* Input */}
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

export default ChatArea;
