import { useState } from 'react'
import ChatLayout from './components/ChatLayout'
import LoginPage from './components/LoginPage'
import { ThemeProvider } from './context/ThemeContext'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider>
      <div className="app-container">
        {isLoggedIn ? (
          <ChatLayout />
        ) : (
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        )}
      </div>
    </ThemeProvider>
  )
}

export default App
