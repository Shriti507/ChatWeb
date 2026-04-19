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
                flex-1 overflow-y-auto p-8 pb-20 lg:pb-32 xl:pb-40 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900
                ${className}
            `}
      onScroll={handleScroll}
    >
      <div className="flex flex-col gap-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 text-gray-500 dark:text-gray-400">
            <div className="w-24 h-24 bg-gray-200 rounded-3xl flex items-center justify-center mb-6 mx-auto dark:bg-gray-800">
              <svg
                className="w-12 h-12 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              No messages yet
            </h3>
            <p className="text-sm">
              Start the conversation by sending a message.
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
