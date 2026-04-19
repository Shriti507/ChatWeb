import { useEffect, useState } from "react";
import ChatLayout from "./components/ChatLayout";
import LoginPage from "./components/LoginPage";
import SignupPage from "./components/SignupPage";
import { ThemeProvider } from "./context/ThemeContext";
import { clearToken, getToken, setToken } from "./utils/session";
import { connectSocketWithToken, disconnectSocket } from "./socket";

function App() {
  const [token, setTokenState] = useState(getToken());
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (token) {
      connectSocketWithToken();
      if (path === "/login" || path === "/signup") {
        window.history.replaceState({}, "", "/");
        setPath("/");
      }
      return;
    }
    disconnectSocket();
    if (path !== "/login" && path !== "/signup") {
      window.history.replaceState({}, "", "/login");
      setPath("/login");
    }
  }, [token, path]);

  const handleAuthSuccess = (nextToken) => {
    setToken(nextToken);
    setTokenState(nextToken);
  };

  const handleLogout = () => {
    clearToken();
    setTokenState(null);
  };

  const goToPath = (nextPath) => {
    window.history.pushState({}, "", nextPath);
    setPath(nextPath);
  };

  return (
    <ThemeProvider>
      <div className="app-container">
        {token ? (
          <ChatLayout onLogout={handleLogout} />
        ) : path === "/signup" ? (
          <SignupPage onSignup={handleAuthSuccess} onGoToLogin={() => goToPath("/login")} />
        ) : (
          <LoginPage onLogin={handleAuthSuccess} onGoToSignup={() => goToPath("/signup")} />
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
