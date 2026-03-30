import { useEffect, useState } from "react";
import API from "../api";

const TYPES = ["sick", "casual", "emergency", "academic", "bonafide", "certificate"];

export default function Leaves({ user }) {
  const [leaves, setLeaves] = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/leaves").then(r => { setLeaves(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const apply = async (e) => {
    e.preventDefault();
    if (form.startDate < today) return alert("Start date cannot be in the past.");
    if (form.endDate < form.startDate) return alert("End date cannot be before start date.");
    try {
      const res = await API.post("/leaves", form);
      setLeaves([res.data, ...leaves]);
      setModal(false); setForm({});
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const review = async (id, status) => {
    const reviewNote = status === "rejected" ? prompt("Reason for rejection (optional):") || "" : "";
    try {
      const res = await API.put(`/leaves/${id}/review`, { status, reviewNote });
      setLeaves(leaves.map(l => l._id === id ? res.data : l));
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const filtered = filter === "all" ? leaves : leaves.filter(l => l.status === filter);

  const statusBadge = s => s === "approved" ? "badge-success" : s === "rejected" ? "badge-danger" : "badge-warning";
  const typeColor = t => ({ sick: "#ef4444", casual: "#3b82f6", emergency: "#f59e0b", academic: "#8b5cf6", bonafide: "#10b981", certificate: "#6366f1" })[t] || "#6366f1";

  const pending = leaves.filter(l => l.status === "pending").length;

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">📋 Leave Requests {pending > 0 && <span style={{ color: "#f59e0b" }}>{pending} pending</span>}</h2>
        {user.role === "student" && (
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Apply Leave</button>
        )}
      </div>

      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[["Total", leaves.length, "blue", "📋"], ["Pending", leaves.filter(l => l.status === "pending").length, "orange", "⏳"],
          ["Approved", leaves.filter(l => l.status === "approved").length, "green", "✅"],
          ["Rejected", leaves.filter(l => l.status === "rejected").length, "red", "❌"]].map(([label, val, color, icon]) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info"><p>{label}</p><h3>{val}</h3></div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {["all", "pending", "approved", "rejected"].map(f => (
          <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {loading && [...Array(3)].map((_, i) => <div key={i} className="card" style={{ height: 80, animation: "pulse 1.5s infinite" }} />)}
        {!loading && filtered.length === 0 && (
          <div className="card empty"><div className="empty-icon">📋</div><p>No {filter === "all" ? "" : filter} leave requests</p></div>
        )}
        {!loading && filtered.map(l => (
          <div key={l._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${typeColor(l.type)}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>
                {l.type === "sick" ? "🤒" : l.type === "emergency" ? "🚨" : l.type === "academic" ? "📚" : l.type === "bonafide" ? "📄" : l.type === "certificate" ? "🏆" : "🏖️"}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.95rem", textTransform: "capitalize" }}>{l.type} Leave</span>
                  <span className={`badge ${statusBadge(l.status)}`}>{l.status}</span>
                </div>
                {(user.role === "teacher" || user.role === "admin") && (
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--primary-light)", marginBottom: 2 }}>👤 {l.studentName} {l.studentRoll ? `· ${l.studentRoll}` : ""} {l.class ? `· ${l.class}` : ""}</p>
                )}
                <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: 4 }}>{l.reason}</p>
                <div style={{ display: "flex", gap: 12, fontSize: "0.75rem", color: "var(--text3)" }}>
                  <span>📅 {new Date(l.startDate).toLocaleDateString("en-IN")} → {new Date(l.endDate).toLocaleDateString("en-IN")}</span>
                  <span>⏱ {l.days} day(s)</span>
                  <span>🕐 Applied {new Date(l.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                {l.reviewNote && <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 4, fontStyle: "italic" }}>Note: {l.reviewNote}</p>}
                {l.reviewerName && <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>Reviewed by {l.reviewerName}</p>}
              </div>
            </div>
            {(user.role === "teacher" || user.role === "admin") && l.status === "pending" && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button className="btn btn-success btn-sm" onClick={() => review(l._id, "approved")}>✓ Approve</button>
                <button className="btn btn-danger btn-sm" onClick={() => review(l._id, "rejected")}>✕ Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Apply Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📋 Apply for Leave</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={apply}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Leave Type</label>
                  <select required value={form.type || ""} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="">Select type</option>
                    {TYPES.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input type="date" required min={today} value={form.startDate || ""}
                    onChange={e => setForm({ ...form, startDate: e.target.value, endDate: e.target.value > (form.endDate || "") ? e.target.value : form.endDate })} />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input type="date" required min={form.startDate || today} value={form.endDate || ""}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Reason</label>
                <textarea required rows={4} placeholder="Explain your reason for leave..." onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} type="submit">Submit Application</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
