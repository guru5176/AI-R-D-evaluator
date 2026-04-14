import React, { useState } from "react"
const Dashboard = ({ lastEval, setLastEval }) => {
  const [file, setFile] = useState(null)
  const [budget, setBudget] = useState(100000)
  const [loading, setLoading] = useState(false)
  const handleUpload = async () => {
    if (!file) return alert("Please select a PDF file")
    setLoading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("budget", budget)
    try {
      const response = await fetch("http://localhost:8000/submit/", {
        method: "POST",
        body: formData
      })
      const data = await response.json()
      if (data.error) alert(data.error)
      else setLastEval(data)
    } catch (err) {
      console.error(err)
      alert("Failed to connect to backend")
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="dashboard">
      <div className="header">
        <h1>Welcome Back</h1>
        <p>Analyze your R&D proposals with AI precision.</p>
      </div>
      {!lastEval ? (
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 className="card-title">New Evaluation</h2>
          <div className="form-group">
            <label>Upload Proposal (PDF)</label>
            <div className="upload-zone" onClick={() => document.getElementById("fileInput").click()}>
              {file ? file.name : "Click to upload or drag and drop"}
              <input id="fileInput" type="file" style={{ display: "none" }} onChange={(e) => setFile(e.target.files[0])} accept=".pdf" />
            </div>
          </div>
          <div className="form-group">
            <label>Proposed Budget (₹)</label>
            <input type="number" className="input-field" value={budget} onChange={(e) => setBudget(e.target.value)} />
          </div>
          <button className="btn-primary" onClick={handleUpload} disabled={loading}>{loading ? "Evaluating..." : "Start AI Analysis"}</button>
        </div>
      ) : (
        <div className="results-view">
          <div className="grid">
            <div className="card">
              <h3 className="card-title">Final Score</h3>
              <div style={{ fontSize: "48px", fontWeight: "800", color: "var(--primary)", textAlign: "center" }}>{lastEval.final_score.toFixed(1)}</div>
              <p style={{ textAlign: "center", marginTop: "10px", fontWeight: "600" }}>{lastEval.decision}</p>
            </div>
            <div className="card">
              <h3 className="card-title">Novelty Score</h3>
              <div style={{ fontSize: "32px", fontWeight: "700", textAlign: "center" }}>{lastEval.novelty.toFixed(1)}%</div>
            </div>
            <div className="card">
              <h3 className="card-title">Financial Health</h3>
              <div style={{ fontSize: "32px", fontWeight: "700", textAlign: "center" }}>{lastEval.finance.toFixed(1)}%</div>
            </div>
          </div>
          <div className="card" style={{ marginTop: "24px" }}>
            <h3 className="card-title">AI Evaluation Narrative</h3>
            <div style={{ lineHeight: "1.8", color: "var(--text-muted)" }}>{lastEval.ai_report_text}</div>
          </div>
          <button className="btn-primary" style={{ marginTop: "24px", width: "auto" }} onClick={() => setLastEval(null)}>← New Evaluation</button>
        </div>
      )}
    </div>
  )
}
export default Dashboard
