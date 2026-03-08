import { useState } from 'react'
import ChatLayout from './components/ChatLayout'
import LoginPage from './components/LoginPage'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app-container">
      {isLoggedIn ? (
        <ChatLayout />
      ) : (
        <LoginPage onLogin={() => setIsLoggedIn(true)} />
      )}
    </div>
  )
}

export default App
