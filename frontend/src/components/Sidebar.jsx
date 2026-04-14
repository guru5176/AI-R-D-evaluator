import React from "react"
const Sidebar = ({ activeTab, setActiveTab }) => {
  const items = [
    { id: "home", label: "Dashboard", icon: "📊" },
    { id: "chat", label: "AI Reviewer", icon: "🤖" },
    { id: "history", label: "History", icon: "📜" }
  ]
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: "24px" }}>🚀</span>
        <span>AI Evaluator</span>
      </div>
      <div className="sidebar-nav">
        {items.map(item => (
          <div 
            key={item.id}
            className={"nav-item " + (activeTab === item.id ? "active" : "")}
            onClick={() => setActiveTab(item.id)}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default Sidebar
