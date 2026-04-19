import React, { useState, useEffect } from "react";
import { Phone, Video, MoreHorizontal, Users, ChevronDown, ChevronUp } from "lucide-react";
import { authHeaders } from "../utils/session";
import { API } from "../utils/api";

const ChatHeader = ({
  selectedChat,
  onlineCount,
  isOtherTyping,
  socketJoinError,
  socketJoinLoading,
  onCreatePublicConversation,
  currentUserId,
}) => {
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  // Fetch group members when selected chat is a group
  useEffect(() => {
    if (selectedChat?.isGroup && selectedChat?.id) {
      fetchMembers();
    } else {
      setMembers([]);
      setShowMembers(false);
    }
  }, [selectedChat]);

  const fetchMembers = async () => {
    try {
      const response = await fetch(
        `${API}/api/conversations/${selectedChat.id}/members`,
        { headers: authHeaders() }
      );
      if (response.ok) {
        const data = await response.json();
        setMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch members:", error);
    }
  };

  if (!selectedChat) {
    return (
      <div className="flex h-[80px] items-center justify-center border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
            Select a conversation
          </h3>
          <p className="text-sm">Choose a contact to start messaging</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "G";
    return name.charAt(0).toUpperCase();
  };

  const getGroupAvatar = () => {
    if (selectedChat?.isGroup) {
      return <Users className="w-5 h-5" />;
    }
    return getInitials(selectedChat.name);
  };

  return (
    <div className="flex flex-col border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm shadow-sm">
      <div className="flex h-[80px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className={`h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-lg ${selectedChat?.isGroup ? 'text-lg' : ''}`}>
              {getGroupAvatar()}
            </div>
            {!selectedChat?.isGroup && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-400 border-2 border-white dark:border-gray-900 shadow-sm animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate max-w-[200px]">
              {selectedChat.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {selectedChat?.isGroup ? (
                <button
                  onClick={() => setShowMembers(!showMembers)}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Users className="w-3 h-3" />
                  <span>{members.length} members</span>
                  {showMembers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              ) : isOtherTyping ? (
                <div className="flex gap-1 items-center">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.1s]"></div>
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                  <span className="text-blue-600 dark:text-blue-400">Typing...</span>
                </div>
              ) : (
                <span>{onlineCount} online</span>
              )}
            </div>
          </div>
        </div>

      {(socketJoinLoading || socketJoinError) && (
        <div className="ml-auto pr-4 text-sm bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1 rounded-full border border-red-200 dark:border-red-800/50">
          {socketJoinLoading
            ? "Joining..."
            : socketJoinError === "NOT_INVITED"
              ? "Not invited"
              : socketJoinError}
          {socketJoinError === "CONVERSATION_NOT_FOUND" &&
            onCreatePublicConversation && (
              <button
                className="ml-2 text-blue-600 hover:text-blue-500 font-medium text-xs transition-colors duration-200"
                onClick={onCreatePublicConversation}
              >
                Create
              </button>
            )}
        </div>
      )}

        <div className="flex gap-2">
          <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
            <Phone size={18} />
          </button>
          <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
            <Video size={18} />
          </button>
          <button className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Group Members List */}
      {selectedChat?.isGroup && showMembers && (
        <div className="px-6 pb-4 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="pt-3 space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {member.name}
                    {member.id === currentUserId && (
                      <span className="ml-2 text-xs text-blue-500">(You)</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {member.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
