import React, { useState, useEffect } from "react";
import { X, Users, Search, Check } from "lucide-react";
import { authHeaders } from "../utils/session";

const API_URL = "http://localhost:3000/api";

const CreateGroupModal = ({ isOpen, onClose, onGroupCreated, currentUserId }) => {
  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users`, {
        headers: authHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        // Filter out current user
        setUsers(data.filter((user) => user.id !== currentUserId));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    if (selectedUsers.find((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers.length < 1) return;

    setCreating(true);
    try {
      const response = await fetch(`${API_URL}/conversations/group`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders(),
        },
        body: JSON.stringify({
          name: groupName.trim(),
          userIds: selectedUsers.map((u) => u.id),
        }),
      });

      if (response.ok) {
        const conversation = await response.json();
        onGroupCreated(conversation);
        onClose();
        // Reset form
        setGroupName("");
        setSelectedUsers([]);
        setSearchTerm("");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create group");
      }
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Failed to create group");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create Group
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add members and name your group
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                >
                  <span className="font-medium">{user.name}</span>
                  <button
                    onClick={() => handleUserSelect(user)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Search Users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Members ({selectedUsers.length} selected)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Users List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                Loading users...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No users found
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUsers.find((u) => u.id === user.id);
                return (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`
                      flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                      ${
                        isSelected
                          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                      }
                    `}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all duration-200 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={!groupName.trim() || selectedUsers.length < 1 || creating}
            className={`
              flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200
              ${
                groupName.trim() && selectedUsers.length >= 1 && !creating
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            {creating ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
