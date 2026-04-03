import { useEffect, useState } from "react";
import API from "../api";

export default function TechSupport({ user }) {
  const [tickets, setTickets] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: "", priority: "medium", description: "" });

  useEffect(() => { API.get("/tech").then(r => setTickets(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/tech", { ...form, userName: user.name });
      setTickets([res.data, ...tickets]);
      setModal(false);
      setForm({ category: "", priority: "medium", description: "" });
    } catch (err) { alert(err?.response?.data?.message || "Failed to submit ticket"); }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/tech/${id}`, { status });
      setTickets(tickets.map(t => t._id === id ? res.data : t));
    } catch (err) { alert(err?.response?.data?.message || "Failed to update"); }
  };

  const statusBadge = (s) => s === "resolved" ? "badge-success" : s === "in-progress" ? "badge-info" : "badge-warning";
  const priorityBadge = (p) => p === "high" ? "badge-danger" : p === "medium" ? "badge-warning" : "badge-gray";

  const categoryIcon = (c) => ({ wifi: "📶", lab: "🖥️", software: "💻", hardware: "🔧", portal: "🌐", other: "❓" }[c] || "❓");

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🔧 Technical Assistance</h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setForm({ category: "", priority: "medium", description: "" }); setModal(true); }}>+ Raise Ticket</button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[["Open", "open", "orange"], ["In Progress", "in-progress", "blue"], ["Resolved", "resolved", "green"]].map(([label, val, color]) => (
          <div key={val} className="stat-card">
            <div className={`stat-icon ${color}`}>{val === "open" ? "🔴" : val === "in-progress" ? "🔵" : "✅"}</div>
            <div className="stat-info"><p>{label}</p><h3>{tickets.filter(t => t.status === val).length}</h3></div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {tickets.length === 0 && <div className="card empty"><p>No support tickets</p></div>}
        {tickets.map(t => (
          <div key={t._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: "1.1rem" }}>{categoryIcon(t.category)}</span>
                <span style={{ fontWeight: 600, fontSize: "0.9rem", textTransform: "capitalize" }}>{t.category} Issue</span>
                <span className={`badge ${statusBadge(t.status)}`}>{t.status}</span>
                <span className={`badge ${priorityBadge(t.priority)}`}>{t.priority} priority</span>
              </div>
              <p style={{ fontSize: "0.875rem", color: "var(--text2)" }}>{t.description}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 4 }}>
                By {t.userName} • {new Date(t.createdAt).toLocaleDateString()}
                {t.resolvedAt && ` • Resolved: ${new Date(t.resolvedAt).toLocaleDateString()}`}
              </p>
            </div>
            {user.role === "admin" && t.status !== "resolved" && (
              <div style={{ display: "flex", gap: 8 }}>
                {t.status === "open" && (
                  <button className="btn btn-outline btn-sm" onClick={() => updateStatus(t._id, "in-progress")}>
                    Start
                  </button>
                )}
                <button className="btn btn-success btn-sm" onClick={() => updateStatus(t._id, "resolved")}>
                  Resolve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Raise Tech Support Ticket</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Category</label>
                  <select required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    <option value="">Select category</option>
                    <option value="wifi">WiFi / Network</option>
                    <option value="lab">Computer Lab</option>
                    <option value="software">Software Issue</option>
                    <option value="hardware">Hardware Issue</option>
                    <option value="portal">ERP Portal</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Description</label>
                <textarea required rows={4} placeholder="Describe the technical issue..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">
                Submit Ticket
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
