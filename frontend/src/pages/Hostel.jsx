import { useEffect, useState } from "react";
import API from "../api";

export default function Hostel({ user }) {
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [progressInputs, setProgressInputs] = useState({});   // { [requestId]: noteText }
  const [expandedUpdates, setExpandedUpdates] = useState({}); // { [requestId]: bool }

  useEffect(() => { API.get("/hostel").then(r => setRequests(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/hostel", { ...form, studentName: user.name });
      setRequests([res.data, ...requests]);
      setModal(false); setForm({});
    } catch (err) { alert(err?.response?.data?.message || "Failed to submit"); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/hostel/${id}`, { status });
      setRequests(requests.map(r => r._id === id ? res.data : r));
    } catch (err) { alert(err?.response?.data?.message || "Failed to update"); }
  };

  const confirmSolved = async (id, studentFeedback) => {
    try {
      const res = await API.put(`/hostel/${id}`, { status: "resolved", studentFeedback });
      setRequests(requests.map(r => r._id === id ? res.data : r));
    } catch (err) { alert(err?.response?.data?.message || "Failed to confirm"); }
  };

  const addProgress = async (id) => {
    const note = (progressInputs[id] || "").trim();
    if (!note) return;
    try {
      const res = await API.put(`/hostel/${id}`, { progressNote: note });
      setRequests(requests.map(r => r._id === id ? res.data : r));
      setProgressInputs(p => ({ ...p, [id]: "" }));
      setExpandedUpdates(e => ({ ...e, [id]: true }));
    } catch (err) { alert(err?.response?.data?.message || "Failed to add update"); }
  };

  const statusBadge = (s) => s === "resolved" ? "badge-success" : s === "in-progress" ? "badge-info" : "badge-warning";

  const feedbackStyle = (f) => ({
    "completed":   { bg: "#d1fae5", color: "#065f46", icon: "✅", label: "Completed"    },
    "in-progress": { bg: "#dbeafe", color: "#1e40af", icon: "🔄", label: "Still In Progress" },
    "not-done":    { bg: "#fee2e2", color: "#991b1b", icon: "❌", label: "Not Done"     },
  }[f] || null);

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🏠 Hostel Room Maintenance</h2>
        {user.role === "student" && (
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Raise Request</button>
        )}
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[["Open", "open", "orange", "🔴"], ["In Progress", "in-progress", "blue", "🔵"], ["Resolved", "resolved", "green", "✅"]].map(([label, val, color, icon]) => (
          <div key={val} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info"><p>{label}</p><h3>{requests.filter(r => r.status === val).length}</h3></div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><p>Completed</p><h3>{requests.filter(r => r.studentFeedback === "completed").length}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">🔄</div>
          <div className="stat-info"><p>Still In Progress</p><h3>{requests.filter(r => r.studentFeedback === "in-progress").length}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-info"><p>Not Done</p><h3>{requests.filter(r => r.studentFeedback === "not-done").length}</h3></div>
        </div>
      </div>

      {requests.length === 0 && <div className="card empty"><div className="empty-icon">🏠</div><p>No maintenance requests</p></div>}

      <div style={{ display: "grid", gap: 14 }}>
        {requests.map(r => {
          const fb = feedbackStyle(r.studentFeedback);
          const isExpanded = expandedUpdates[r._id];
          const updates = r.progressUpdates || [];
          return (
            <div key={r._id} className="card" style={{ borderLeft: `4px solid ${r.status === "resolved" ? "#10b981" : r.status === "in-progress" ? "#3b82f6" : "#f59e0b"}` }}>

              {/* ── Top row: meta + status + admin action ── */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginBottom: 2 }}>Student</p>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.studentName}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginBottom: 2 }}>Room · Block</p>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.roomNo} · {r.block}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginBottom: 2 }}>Issue</p>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", textTransform: "capitalize" }}>{r.issueType}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginBottom: 2 }}>Raised On</p>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem" }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status dropdown — admin: full control | student: all options incl. completed */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <label style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Status</label>
                  {user.role !== "student" ? (
                    <select value={r.status} onChange={e => updateStatus(r._id, e.target.value)}
                      style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                      <option value="open">🔴 Open</option>
                      <option value="in-progress">🔵 In Progress</option>
                      <option value="resolved">✅ Resolved</option>
                    </select>
                  ) : (
                    <select
                      value={r.status === "resolved" && r.studentFeedback === "not-done" ? "not-done" : r.status}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "completed")  confirmSolved(r._id, "completed");
                        else if (val === "not-done") confirmSolved(r._id, "not-done");
                        else updateStatus(r._id, val);
                      }}
                      disabled={r.status === "resolved" && r.studentConfirmed}
                      style={{
                        padding: "5px 10px", borderRadius: 8, border: "1px solid var(--border2)",
                        fontSize: "0.82rem", fontWeight: 600, cursor: r.studentConfirmed ? "not-allowed" : "pointer",
                        background:
                          r.status === "resolved" ? "rgba(16,185,129,0.1)"
                          : r.status === "in-progress" ? "rgba(59,130,246,0.1)"
                          : "rgba(245,158,11,0.1)",
                        color:
                          r.status === "resolved" ? "#10b981"
                          : r.status === "in-progress" ? "#3b82f6"
                          : "#f59e0b",
                      }}>
                      <option value="open">🔴 Open</option>
                      <option value="in-progress">🔵 In Progress</option>
                      <option value="completed">✅ Completed</option>
                      <option value="not-done">❌ Not Done</option>
                    </select>
                  )}
                  {/* feedback label after student confirms */}
                  {user.role === "student" && r.studentConfirmed && (() => {
                    const fb = feedbackStyle(r.studentFeedback);
                    return fb ? <span style={{ fontSize: "0.68rem", fontWeight: 700, color: fb.color }}>{fb.icon} {fb.label}</span> : null;
                  })()}
                  {/* awaiting feedback badge for admin */}
                  {user.role !== "student" && r.status === "resolved" && !r.studentConfirmed && (
                    <span style={{ fontSize: "0.65rem", color: "#f59e0b", fontWeight: 600 }}>⏳ Awaiting student</span>
                  )}
                  {user.role !== "student" && r.status === "resolved" && r.studentConfirmed && (() => {
                    const fb = feedbackStyle(r.studentFeedback);
                    return fb ? <span style={{ fontSize: "0.65rem", fontWeight: 700, color: fb.color }}>{fb.icon} {fb.label}</span> : null;
                  })()}
                </div>
              </div>

              {/* Description */}
              <p style={{ fontSize: "0.85rem", color: "var(--text2)", margin: "10px 0 0" }}>{r.description}</p>

              {/* ── Progress Updates Timeline ── */}
              {updates.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={() => setExpandedUpdates(e => ({ ...e, [r._id]: !isExpanded }))}
                    style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--primary-light)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    {isExpanded ? "▲ Hide" : "▼ Show"} {updates.length} progress update{updates.length > 1 ? "s" : ""}
                  </button>
                  {isExpanded && (
                    <div style={{ marginTop: 8, borderLeft: "2px solid var(--border)", paddingLeft: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      {updates.map((u, i) => (
                        <div key={i}>
                          <p style={{ fontSize: "0.8rem", color: "var(--text2)" }}>💬 {u.note}</p>
                          <p style={{ fontSize: "0.68rem", color: "var(--text3)", marginTop: 2 }}>{new Date(u.addedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Student Actions — progress note only ── */}
              {user.role === "student" && r.status !== "resolved" && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={progressInputs[r._id] || ""}
                      onChange={e => setProgressInputs(p => ({ ...p, [r._id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && addProgress(r._id)}
                      placeholder="Add a progress update for admin..."
                      style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.8rem", background: "var(--bg2)" }}
                    />
                    <button className="btn btn-outline btn-sm" onClick={() => addProgress(r._id)}>📤 Send</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Raise Maintenance Request</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Room Number</label>
                  <input required placeholder="e.g. 204" onChange={e => setForm({ ...form, roomNo: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Block</label>
                  <input required placeholder="e.g. Block A" onChange={e => setForm({ ...form, block: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Issue Type</label>
                  <select required onChange={e => setForm({ ...form, issueType: e.target.value })}>
                    <option value="">Select issue</option>
                    <option value="electrical">Electrical</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="furniture">Furniture</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Description</label>
                <textarea required placeholder="Describe the issue in detail..." onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">
                Submit Request
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
