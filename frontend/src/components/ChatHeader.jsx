import React from "react";
import { Phone, Video, MoreHorizontal } from "lucide-react";

const ChatHeader = ({
  selectedChat,
  onlineCount,
  isOtherTyping,
  socketJoinError,
  socketJoinLoading,
  onCreatePublicConversation,
}) => {
  if (!selectedChat) {
    return (
      <div className="flex h-[80px] items-center justify-center border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Select a conversation
          </h3>
          <p className="text-sm">Choose a contact to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[80px] items-center justify-between border-b border-gray-200 px-6 py-4 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {selectedChat.name?.charAt(0) || "U"}
          </div>
          <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white dark:border-gray-900 shadow-sm animate-pulse-slow"></div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate max-w-[200px]">
            {selectedChat.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            {isOtherTyping ? (
              <div className="flex gap-1">
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse-slow"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse-slow [animation-delay:0.1s]"></div>
                <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse-slow [animation-delay:0.2s]"></div>
                <span>Typing...</span>
              </div>
            ) : (
              <span>{onlineCount} online</span>
            )}
          </div>
        </div>
      </div>

      {(socketJoinLoading || socketJoinError) && (
        <div className="ml-auto pr-4 text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full dark:bg-red-900/20 dark:text-red-400 border">
          {socketJoinLoading
            ? "Joining..."
            : socketJoinError === "NOT_INVITED"
              ? "Not invited"
              : socketJoinError}
          {socketJoinError === "CONVERSATION_NOT_FOUND" &&
            onCreatePublicConversation && (
              <button
                className="ml-2 text-blue-600 hover:text-blue-500 font-medium text-xs"
                onClick={onCreatePublicConversation}
              >
                Create
              </button>
            )}
        </div>
      )}

      <div className="flex gap-2">
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
          <Phone size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
          <Video size={20} />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
