import React from "react";

const MessageBubble = ({ message, currentUserId, className = "" }) => {
  const isSelf = message.self || message.senderId === currentUserId;

  const getStatusIcon = () => {
    if (message.status === "failed")
      return <span className="text-red-400 !mr-0">⚠️</span>;
    if (message.status === "pending")
      return <span className="animate-pulse text-blue-400">⟳</span>;
    return <span className="text-blue-400 ml-0.5 text-xs">✓✓</span>;
  };

  return (
    <div
      className={`
        group flex ${isSelf ? "justify-end" : "justify-start"} gap-3 p-2
        ${className}
      `}
    >
      {!isSelf && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shadow-lg flex-shrink-0">
          {message.sender?.charAt(0).toUpperCase() || "U"}
        </div>
      )}

      <div
        className={`
          max-w-[70%] px-4 py-3 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg
          ${
            isSelf
              ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-sm ml-auto hover:from-blue-600 hover:to-blue-700"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-sm hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200/50 dark:border-gray-700/50"
          }
          ${message.status === "failed" ? "ring-2 ring-red-200 dark:ring-red-800/50" : ""}
        `}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>

        <div className={`flex items-center mt-2 text-xs ${isSelf ? "justify-end" : "justify-start"}`}>
          <span className={`opacity-60 ${isSelf ? "mr-1.5" : "mr-0"}`}>
            {message.time}
          </span>
          {isSelf && (
            <span className="flex items-center opacity-80 gap-0.5">
              {getStatusIcon()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
