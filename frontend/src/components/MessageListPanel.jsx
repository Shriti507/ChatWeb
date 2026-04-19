import React, { useState, useEffect } from "react";
import { authHeaders } from "../utils/session";
import { Search, Users } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";
import { API } from "../utils/api";

const MessageListPanel = ({
  onSelectChat,
  selectedChat,
  conversations = [],
  allUsers = [],
  onStartChat,
  onlineUserIds = new Set(),
  onGroupCreated,
  currentUserId,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const filteredConversations = conversations.filter((convo) =>
    convo.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        return;
      }

      console.log("[DEBUG] Searching for username:", searchTerm);
      console.log("[DEBUG] Fetch URL:", `${API}/api/users/search?username=${encodeURIComponent(searchTerm)}`);
      fetch(`${API}/api/users/search?username=${encodeURIComponent(searchTerm)}`, {
        headers: authHeaders(),
        credentials: "include", // This matches the backend 'credentials: true' config
  })
        .then(async (r) => {
          console.log("[DEBUG] Response status:", r.status);
          const text = await r.text();
          console.log("[DEBUG] Response text preview:", text.substring(0, 100));
          if (!r.ok) {
            throw new Error(`HTTP ${r.status}: ${text.substring(0, 100)}`);
          }
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error(`Invalid JSON: ${text.substring(0, 100)}`);
          }
        })
        .then((data) => {
          console.log("[DEBUG] Search results:", data);
          setSearchResults(data);
        })
        .catch((err) => {
          console.error("[DEBUG] Search error:", err.message);
          setSearchResults([]);
        });
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
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No users found</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Try searching for a different email address</p>
            </div>
          </div>
        );
      }

        return searchResults.map((user) => {
          const isSelected = selectedChat?.id === user.id;

          return (
            <div
              key={user.id}
              className={`
                flex gap-4 p-4 cursor-pointer transition-all duration-200 group
                ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border-r-4 border-blue-500 shadow-lg"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md"
                }
              `}
              onClick={() => {
                console.log("[DEBUG] Clicked user from search:", user);
                onStartChat(user.id);
              }}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-200">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-3 border-white dark:border-gray-900 rounded-full shadow-lg"></div>
              </div>

              <div className="flex-1 min-w-0 py-1">
                <h4 className="font-semibold text-gray-900 truncate dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                  {user.name}
                </h4>
                <p className="text-sm text-gray-500 truncate dark:text-gray-400 max-w-[200px] group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
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
          <div className="flex-1 flex items-center justify-center p-8 text-center">
            <div className="max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">No conversations</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">No conversations matching your search</p>
            </div>
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
              className={`
                flex gap-4 p-4 cursor-pointer transition-all duration-200 group
                ${
                  isSelected
                    ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-500/10 dark:to-purple-500/10 border-r-4 border-blue-500 shadow-lg"
                    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md"
                }
              `}
              onClick={() => onSelectChat(conversation)}
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-200">
                  {conversation.name.charAt(0).toUpperCase()}
                </div>

                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-3 border-white dark:border-gray-900 rounded-full shadow-lg"></div>
                )}
              </div>

              <div className="flex-1 min-w-0 py-1">
                <div className="flex justify-between mb-1">
                  <h4 className="font-semibold text-gray-900 truncate dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                    {conversation.name}
                  </h4>
                  <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors duration-200">
                    {conversation.time}
                  </span>
                </div>

                <p className="text-sm text-gray-500 truncate dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
                  {conversation.lastMessage || "No messages yet"}
                </p>
              </div>

              {unreadCount > 0 && (
                <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-blue-500/25">
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
          className="flex gap-4 p-4 cursor-pointer transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:shadow-md"
          onClick={() => onStartChat(user.id)}
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-105 transition-transform duration-200">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0 py-1">
            <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
              {user.name}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-200">
              {user.email}
            </p>
          </div>
        </div>
      ));
    }


    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Search className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Discover users</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Search users by email to start new conversations
          </p>
        </div>
      </div>
    );
  };

  return (
    <>
      <aside className="w-80 lg:w-96 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-700/50 flex flex-col shadow-xl">
        <div className="p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Messages
            </h2>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm font-medium"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">New Group</span>
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search users by email..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200/50 dark:border-gray-600/50 dark:bg-gray-800/50 dark:text-white bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 shadow-sm focus:shadow-md transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{renderContent()}</div>
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

export default MessageListPanel;