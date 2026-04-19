import React, { useState, useEffect } from "react";
import { authHeaders } from "../utils/session";
import { Search } from "lucide-react";

const MessageListPanel = ({
  onSelectChat,
  selectedChat,
  conversations = [],
  allUsers = [],
  onStartChat,
  onlineUserIds = new Set(),
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const filteredConversations = conversations.filter((convo) =>
    convo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      fetch(`/api/users/search?email=${encodeURIComponent(searchTerm)}`, {
        headers: authHeaders(),
      })
        .then((r) => r.json())
        .then(setSearchResults)
        .catch(() => setSearchResults([]));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const isUserOnline = (conversation) => {
    return Array.from(onlineUserIds).some((userId) =>
      conversation.participants?.some((p) => p.id === userId)
    );
  };

  const getUnreadCount = () => 0;


  const renderContent = () => {
   
    if (searchTerm.length > 0) {
      if (searchResults.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center dark:bg-gray-700">
              <Search className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-sm">Try searching for a different email</p>
          </div>
        );
      }

      return searchResults.map((user) => {
        const isSelected = selectedChat?.id === user.id;

        return (
          <div
            key={user.id}
            className={`flex gap-4 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
              ${
                isSelected
                  ? "bg-gradient-to-r from-pink-50 to-pink-25 dark:from-pink-500/10 dark:to-pink-600/10 border-r-4 border-pink-500 shadow-inner"
                  : ""
              }`}
            onClick={() => onStartChat(user.id)}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0 py-1">
              <h4 className="font-semibold text-gray-900 truncate dark:text-white text-base">
                {user.name}
              </h4>
              <p className="text-sm text-gray-500 truncate dark:text-gray-400 max-w-[200px]">
                {user.email}
              </p>
            </div>
          </div>
        );
      });
    }

    
    if (conversations.length > 0) {
      if (filteredConversations.length === 0) {
        return (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4 flex items-center justify-center dark:bg-gray-700">
              <Search className="w-8 h-8 opacity-50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No conversations</h3>
            <p className="text-sm">No conversations matching your search</p>
          </div>
        );
      }

      return filteredConversations.map((conversation) => {
        const isOnline = isUserOnline(conversation);
        const unreadCount = getUnreadCount(conversation);
        const isSelected = selectedChat?.id === conversation.id;

        return (
          <div
            key={conversation.id}
            className={`flex gap-4 p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800
              ${
                isSelected
                  ? "bg-gradient-to-r from-pink-50 to-pink-25 dark:from-pink-500/10 dark:to-pink-600/10 border-r-4 border-pink-500 shadow-inner"
                  : ""
              }`}
            onClick={() => onSelectChat(conversation)}
          >
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                {conversation.name.charAt(0).toUpperCase()}
              </div>

              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              )}
            </div>

            <div className="flex-1 min-w-0 py-1">
              <div className="flex justify-between mb-1">
                <h4 className="font-semibold text-gray-900 truncate dark:text-white text-base">
                  {conversation.name}
                </h4>
                <span className="text-xs text-gray-400">
                  {conversation.time}
                </span>
              </div>

              <p className="text-sm text-gray-500 truncate dark:text-gray-400">
                {conversation.lastMessage || "No messages yet"}
              </p>
            </div>

            {unreadCount > 0 && (
              <div className="w-6 h-6 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
        );
      });
    }

      
    if (allUsers.length > 0) {
      return allUsers.map((user) => (
        <div
          key={user.id}
          className="flex gap-4 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => onStartChat(user.id)}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {user.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
      ));
    }


    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <h3 className="text-lg font-semibold">Discover users</h3>
        <p className="text-sm">
          Search users by email to start new conversations
        </p>
      </div>
    );
  };

  return (
    <aside className="w-[380px] bg-white border-r flex flex-col dark:bg-gray-900">
    
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Messages</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by email..."
            className="w-full pl-10 py-3 rounded-xl border dark:bg-gray-800 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      
      <div className="flex-1 overflow-y-auto">{renderContent()}</div>
    </aside>
  );
};

export default MessageListPanel;