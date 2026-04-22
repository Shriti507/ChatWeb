import React, { useState, useEffect } from "react";
import { Search, Users } from "lucide-react";
import ChatItem from "./ChatItem";
import CreateGroupModal from "./CreateGroupModal";
import { authHeaders } from "../utils/session";
import { API } from "../utils/api";
import "../styles/ChatApp.css";

const ChatList = ({
  onSelectChat,
  selectedChat,
  uniqueChats = [],
  // currentUser,
  onStartChat,
  onlineUserIds = new Set(),
  onGroupCreated,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const filteredUniqueChats = (uniqueChats || []).filter((chat) =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      fetch(
        `${API}/api/users/search?username=${encodeURIComponent(searchTerm)}`,
        {
          headers: authHeaders(),
          credentials: "include",
        }
      )
        .then(async (r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const isOnline = (chat) => {
    if (!chat.otherParticipant) return false;
    return onlineUserIds.has(chat.otherParticipant.id);
  };

  const getUnreadCount = (chat) => chat.unreadCount || 0;

  const renderContent = () => {
    if (searchTerm.length > 0) {
      if (searchResults.length === 0) {
        return (
          <div className="empty-state">
            <div className="empty-icon">
              <Search />
            </div>
            <h3 className="empty-title">No users found</h3>
            <p className="empty-subtitle">
              Try searching for a different email address
            </p>
          </div>
        );
      }

      return searchResults.map((user) => {
        const searchChat = {
          id: user.id,
          name: user.name,
          email: user.email,
          lastMessage: user.email,
          time: "",
          isGroup: false,
          unreadCount: 0,
          participants: [user],
          otherParticipant: user,
        };
        const isActive = selectedChat?.id === user.id;

        return (
          <ChatItem
            key={user.id}
            chat={searchChat}
            isActive={isActive}
            isOnline={onlineUserIds.has(user.id)}
            unreadCount={0}
            onClick={() => onStartChat(user.id)}
          />
        );
      });
    }

    if (uniqueChats.length > 0) {
      if (filteredUniqueChats.length === 0) {
        return (
          <div className="empty-state">
            <div className="empty-icon">
              <Search />
            </div>
            <h3 className="empty-title">No conversations</h3>
            <p className="empty-subtitle">
              No conversations matching your search
            </p>
          </div>
        );
      }

      return filteredUniqueChats.map((chat) => (
        <ChatItem
          key={chat.id}
          chat={chat}
          isActive={selectedChat?.id === chat.id}
          isOnline={isOnline(chat)}
          unreadCount={getUnreadCount(chat)}
          onClick={() => onSelectChat(chat)}
        />
      ));
    }

    return (
      <div className="empty-state">
        <div className="empty-icon">
          <Search />
        </div>
        <h3 className="empty-title">Discover users</h3>
        <p className="empty-subtitle">
          Search users by email to start new conversations
        </p>
      </div>
    );
  };

  return (
    <>
      <aside className="chat-list">
        <header className="chat-header">
          <h1 className="chat-title">Messages</h1>
          <button
            className="new-group-btn"
            onClick={() => setIsCreateGroupOpen(true)}
          >
            <Users className="new-group-icon" />
            <span>New Group</span>
          </button>
        </header>

        <div className="search-container">
          <Search className="search-icon" />
          <input
            className="search-input"
            placeholder="Search users by email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="chat-items-container">{renderContent()}</div>
      </aside>

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onGroupCreated={onGroupCreated}
        currentUserId={currentUserId}
      />
    </>
  );
};

export default ChatList;
