import React, { useState, useEffect } from "react";
import { MessageSquare, HelpCircle, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { authHeaders, getCurrentUserId } from "../utils/session";
import { API } from "../utils/api";
import "../styles/ChatApp.css";

const UserSidebar = ({ onLogout }) => {
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (!userId) {
      setTimeout(() => setLoadingUser(false), 0);
      return;
    }
    fetch(`${API}/api/users/me`, {
      headers: authHeaders(),
    })
      .then((res) => res.json())
      .then(setCurrentUser)
      .catch(() => setCurrentUser(null))
      .finally(() => setLoadingUser(false));
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

  const handleLogout = async () => {
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: authHeaders(),
      });
    } catch (error) {
      console.error("Logout API error:", error);
    }
    if (onLogout) onLogout();
  };

  return (
    <aside className="user-sidebar">
      <header className="user-sidebar-header">
        <div className="logo">C</div>
        <h2 className="sidebar-title">ChatWeb</h2>
      </header>

      <nav className="user-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`nav-item ${item.active ? "active" : ""}`}
            >
              <Icon className="nav-icon" />
              <span>{item.label}</span>
              {item.badge && <div className="badge">{item.badge}</div>}
            </div>
          );
        })}
      </nav>

      <div className="user-profile-section">
        <div className="user-profile">
          <div className="profile-avatar">
            {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="profile-info">
            <h4>
              {loadingUser
                ? "Loading..."
                : currentUser?.name || currentUser?.email || "User"}
            </h4>
            <div className="profile-status">
              {currentUser?.email?.split("@")[0]?.toUpperCase() || "User"}
            </div>
          </div>
        </div>

        <div className="theme-toggle" onClick={toggleTheme}>
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          <span>Toggle Theme</span>
        </div>

        <div className="logout-btn" onClick={handleLogout}>
          <LogOut size={18} />
        </div>
      </div>
    </aside>
  );
};

export default UserSidebar;
