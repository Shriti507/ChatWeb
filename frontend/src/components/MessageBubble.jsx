import React from "react";

const MessageBubble = ({ message, currentUserId, className = "" }) => {
  const isSelf = message.self || message.senderId === currentUserId;

  const getStatusIcon = () => {
    if (message.status === "failed")
      return <span className="text-red-400 !mr-0">⚠️</span>;
    if (message.status === "pending")
      return <span className="animate-pulse">⟳</span>;
    return <span className="text-green-400 ml-0.5 text-xs">✓✓</span>;
  };

  return (
    <div
      className={`
            group flex ${isSelf ? "justify-end" : "justify-start"} gap-3 p-1
            ${className}
        `}
    >
      {!isSelf && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 shadow-md flex-shrink-0 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300">
          {message.sender?.charAt(0).toUpperCase() || "U"}
        </div>
      )}

      <div
        className={`
                max-w-[70%] p-4 rounded-3xl shadow-lg transition-all duration-200 animate-fadeIn group-hover:shadow-xl
                ${
                  isSelf
                    ? "bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-br-md ml-auto"
                    : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border"
                }
                ${message.status === "failed" ? "ring-2 ring-red-200 dark:ring-red-800/50" : ""}
            `}
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
          {message.text}
        </p>

        <div className="flex items-center justify-end mt-2 pt-2 border-t border-white/30 dark:border-gray-700/50">
          <span className="text-xs opacity-75 mr-1.5">{message.time}</span>
          {isSelf && (
            <span className="flex items-center text-xs opacity-80 gap-0.5">
              {getStatusIcon(message.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
