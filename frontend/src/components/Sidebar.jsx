import React from "react";
import { MessageSquare, HelpCircle, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";
import { authHeaders, getCurrentUserId } from "../utils/session";
import { API } from "../utils/api";

const Sidebar = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setTimeout(() => setLoadingUser(false), 0);
      return;
    }
    setTimeout(() => setLoadingUser(false), 0);
    fetch(`${API}/api/users/me`, {
      headers: authHeaders(),
    })
      .then((res) => res.json())
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null));
  }, []);
  const navItems = [
    {
      id: "messages",
      icon: MessageSquare,
      label: "Messages",
      active: true,
      badge: 3,
    },
    { id: "help", icon: HelpCircle, label: "Help" },
  ];

  return (
    <aside className="w-20 lg:w-64 bg-gradient-to-b from-gray-900 to-gray-800 dark:from-gray-950 dark:to-gray-900 text-white flex flex-col p-4 lg:p-6 shadow-2xl backdrop-blur-lg border-r border-gray-700/50 transition-all duration-300">
      <header className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg shadow-blue-500/25 transform rotate-3 hover:rotate-6 transition-transform duration-300"></div>
        <h2 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent hidden lg:block">
          ChatWeb
        </h2>
      </header>

      <nav className="flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`
                flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl cursor-pointer
                transition-all duration-200 group relative
                ${
                  item.active
                    ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-blue-500/10 border border-blue-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50 hover:shadow-md"
                }
              `}
            >
              <Icon
                size={20}
                className={`
                  transition-colors duration-200
                  ${
                    item.active
                      ? "text-blue-400 group-hover:text-blue-300"
                      : "text-gray-400 group-hover:text-white"
                  }
                `}
              />
              <span className="font-medium text-sm lg:text-base flex-1 hidden lg:block">
                {item.label}
              </span>
              {item.badge && (
                <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/25">
                  {item.badge}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 space-y-3">
        {/* Theme Toggle Button */}
        <div
          onClick={toggleTheme}
          className="
            flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-xl cursor-pointer
            text-gray-400 hover:text-white hover:bg-gray-700/50
            transition-all duration-200 group
          "
        >
          {theme === "light" ? (
            <Moon size={20} className="group-hover:rotate-12 transition-transform duration-200" />
          ) : (
            <Sun size={20} className="group-hover:rotate-12 transition-transform duration-200" />
          )}
          <span className="font-medium text-sm lg:text-base hidden lg:block">
            {theme === "light" ? "Dark Mode" : "Light Mode"}
          </span>
        </div>

        <div className="text-xs text-gray-500 hidden lg:block">
          <p className="mb-1">©2026 ChatWeb</p>
          <p>All rights reserved</p>
        </div>

        <div className="
          flex items-center gap-3 p-2 lg:p-3 rounded-xl
          bg-gray-700/30 backdrop-blur-sm border border-gray-600/30
          transition-all duration-300 hover:bg-gray-700/50 hover:shadow-lg
        ">
          <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm lg:text-base shadow-lg">
            {currentUser?.name?.charAt(0)?.toUpperCase() || loadingUser
              ? ""
              : "U"}
          </div>
          <div className="flex-1 min-w-0 hidden lg:block">
            <div className="font-semibold text-sm text-white truncate">
              {loadingUser
                ? "Loading..."
                : currentUser?.name || currentUser?.email || "User"}
            </div>
            <div className="text-xs bg-gradient-to-r from-blue-600 to-purple-600 text-white px-2 py-1 rounded-md inline-block mt-1 font-medium">
              {loadingUser
                ? ""
                : currentUser?.email?.split("@")[0]?.charAt(0).toUpperCase() ||
                  "User"}
            </div>
          </div>
          <div
            className="
              p-2 rounded-lg border border-gray-600/50
              flex items-center justify-center cursor-pointer
              transition-all duration-200 hover:bg-red-500/20 hover:border-red-500/50 group
            "
            onClick={async () => {
              try {
                await fetch(`${API}/auth/logout`, {
                  method: "POST",
                  headers: authHeaders(),
                });
                alert("Logged out successfully");
              } catch (error) {
                console.error("Logout API error:", error);
                alert("Logged out");
              }
              if (onLogout) onLogout();
            }}
          >
            <LogOut
              size={16}
              className="text-gray-400 group-hover:text-red-400 transition-colors duration-200"
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
