import React, { useRef, useEffect, useCallback } from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, className = "" }) => {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleScroll = () => {
    // Infinite scroll up logic can be added here
  };

  return (
    <div
      ref={messagesContainerRef}
      className={`
        flex-1 overflow-y-auto p-6 pb-24 lg:pb-32 xl:pb-40 
        bg-gradient-to-b from-gray-50/50 via-white to-gray-50/50 
        dark:from-gray-900/50 dark:via-gray-900 dark:to-gray-900/50
        ${className}
      `}
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-4 max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl flex items-center justify-center mb-8 shadow-lg">
              <svg
                className="w-12 h-12 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              No messages yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
              Start the conversation by sending a message. Be the first to say hello!
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id || message.clientMessageId || index}
              message={message}
              currentUserId={null} // Passed from parent if needed
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
