import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Chat from './components/Chat'
import History from './components/History'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [lastEval, setLastEval] = useState(null)
  const [chatHistory, setChatHistory] = useState([])

  return (
    <div className="app-container" style={{ display: 'flex', width: '100%' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="main-content">
        {activeTab === 'home' && (
          <Dashboard lastEval={lastEval} setLastEval={setLastEval} />
        )}
        {activeTab === 'chat' && (
          <Chat lastEval={lastEval} chatHistory={chatHistory} setChatHistory={setChatHistory} />
        )}
        {activeTab === 'history' && (
          <History />
        )}
      </main>
    </div>
  )
}

export default App
