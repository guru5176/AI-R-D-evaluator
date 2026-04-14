import React, { useState } from "react"
const Chat = ({ lastEval, chatHistory, setChatHistory }) => {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const handleAsk = async () => {
    if (!query.trim()) return
    if (!lastEval) return alert("Please evaluate a proposal first")
    const userMsg = { role: "user", text: query }
    setChatHistory([...chatHistory, userMsg])
    setQuery("")
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("question", query)
      formData.append("proposal_text", lastEval.proposal_text || "")
      formData.append("final_score", lastEval.final_score)
      formData.append("decision", lastEval.decision)
      const response = await fetch("http://localhost:8000/ask/", {
        method: "POST",
        body: formData
      })
      const data = await response.json()
      const botMsg = { role: "bot", text: data.answer }
      setChatHistory(prev => [...prev, botMsg])
    } catch (err) {
      console.error(err)
      alert("Chat failed")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="chat-view">
      <div className="header">
        <h1>Reviewer Agent</h1>
        <p>Chat with our AI to understand the logic behind your evaluation.</p>
      </div>
      <div className="card chat-container">
        <div className="chat-messages">
          {chatHistory.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "40px" }}>
              Ask something like: "Why is the score low?" or "How to improve novelty?"
            </p>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={"message " + msg.role}>{msg.text}</div>
          ))}
          {loading && <div className="message bot">AI is thinking...</div>}
        </div>
        <div className="chat-input-area">
          <input type="text" className="input-field" placeholder="Type your question..." value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAsk()} />
          <button className="btn-primary" style={{ width: "100px" }} onClick={handleAsk}>Send</button>
        </div>
      </div>
    </div>
  )
}
export default Chat
