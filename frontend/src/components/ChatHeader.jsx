import React, { useState, useEffect } from "react";
import { Phone, Video, MoreHorizontal, Users, ChevronDown, ChevronUp } from "lucide-react";
import { authHeaders } from "../utils/session";
import { API } from "../utils/api";

const ChatHeader = ({
  selectedChat,
  onlineCount,
  isOtherTyping,
  
  currentUserId,
}) => {
  const [members, setMembers] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

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
      <div className="flex h-[80px] items-center justify-center border-b">
        <div className="text-center">
          <h3>Select a conversation</h3>
          <p>Choose a contact to start messaging</p>
        </div>
      </div>
    );
  }

  const getInitials = (name) => name?.charAt(0).toUpperCase() || "G";

  const getGroupAvatar = () => {
    if (selectedChat?.isGroup) {
      return <Users className="w-5 h-5" />;
    }
    return getInitials(selectedChat.name);
  };

  return (
    <div className="flex flex-col border-b">
      <div className="flex h-[80px] items-center justify-between px-6 py-4">
        
        {/* LEFT */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-blue-500 text-white flex items-center justify-center">
              {getGroupAvatar()}
            </div>
          </div>

          <div>
            <h3>{selectedChat.name}</h3>

            <div>
              {selectedChat?.isGroup ? (
                <button onClick={() => setShowMembers(!showMembers)}>
                  {members.length} members
                </button>
              ) : isOtherTyping ? (
                <span>Typing...</span>
              ) : (
                <span>{onlineCount} online</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex gap-2">
          <button><Phone size={18} /></button>
          <button><Video size={18} /></button>
          <button><MoreHorizontal size={18} /></button>
        </div>
      </div>

      {/* ✅ FIXED GROUP MEMBERS BLOCK */}
      {selectedChat?.isGroup && showMembers && (
        <div className="px-6 pb-4">
          <div className="pt-3 space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center">
                  {member.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <p>
                    {member.name}
                    {member.id === currentUserId && " (You)"}
                  </p>
                  <p>{member.email}</p>
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