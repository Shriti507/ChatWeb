import React from "react";
import "../styles/ChatApp.css";

const ChatItem = ({
  chat,
  isActive = false,
  isOnline = false,
  unreadCount = 0,
  onClick,
}) => {
  const getSubtitle = () => {
    if (chat.isGroup) return `${chat.participants?.length || 0} members`;
    return chat.lastMessage || chat.email || "No messages yet";
  };

  const getAvatarContent = () => {
    if (chat.isGroup) return "G";
    return chat.name?.charAt(0).toUpperCase() || "U";
  };

  return (
    <div className={`chat-item ${isActive ? "active" : ""}`} onClick={onClick}>
      <div className="avatar">
        {getAvatarContent()}
        {isOnline && <div className="online-dot" />}
      </div>

      <div className="chat-content">
        <div className="chat-name-row">
          <h4 className="chat-name">{chat.name}</h4>
          <span className="chat-time">{chat.time}</span>
        </div>
        <p className="chat-subtitle">{getSubtitle()}</p>
      </div>

      {unreadCount > 0 && (
        <div className="unread-badge">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};

export default ChatItem;
