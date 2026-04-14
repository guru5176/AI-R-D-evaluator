import React, { useState, useEffect } from "react"
const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch("http://localhost:8000/history/")
      .then(res => res.json())
      .then(data => {
        setHistory(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])
  return (
    <div className="history-view">
      <div className="header">
        <h1>Evaluation History</h1>
        <p>Review past proposal evaluations and decisions.</p>
      </div>
      <div className="grid">
        {loading ? (
          <p>Loading history...</p>
        ) : history.length === 0 ? (
          <p>No evaluations found.</p>
        ) : (
          history.map((item, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <h3 style={{ margin: 0 }}>{item.filename}</h3>
                <span style={{ 
                  padding: "4px 12px", 
                  borderRadius: "20px", 
                  fontSize: "12px", 
                  fontWeight: "700",
                  background: item.final_score >= 85 ? "#E6F4EA" : (item.final_score >= 70 ? "#FFF4E5" : "#FCE8E6"),
                  color: item.final_score >= 85 ? "#1E8E3E" : (item.final_score >= 70 ? "#D97706" : "#D93025")
                }}>
                  {item.final_score.toFixed(1)}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>{item.decision}</p>
              <p style={{ fontSize: "12px", color: "#9A9FA5", marginTop: "12px" }}>{item.created_at}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default History
