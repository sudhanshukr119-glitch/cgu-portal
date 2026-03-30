import { useEffect, useState } from "react";
import API from "../api";

export default function Notifications({ user }) {
  const [notifs, setNotifs] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "info" });
  const [filter, setFilter] = useState("all");

  useEffect(() => { API.get("/notifications").then(r => setNotifs(r.data)).catch(() => {}); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/notifications", form);
      setNotifs([res.data, ...notifs]);
      setModal(false); setForm({ type: "info" });
    } catch {}
  };

  const typeConfig = {
    info:    { icon: "ℹ️", badge: "badge-info",    bg: "rgba(59,130,246,0.06)",  border: "rgba(59,130,246,0.2)" },
    warning: { icon: "⚠️", badge: "badge-warning", bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)" },
    success: { icon: "✅", badge: "badge-success", bg: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)" },
    urgent:  { icon: "🚨", badge: "badge-danger",  bg: "rgba(239,68,68,0.06)",  border: "rgba(239,68,68,0.2)" },
  };

  // Admin sees all; others see only non-admin-targeted notifications
  const visible = notifs.filter(n => user.role === "admin" || !n.targetRole || n.targetRole !== "admin");
  const filtered = filter === "all" ? visible : visible.filter(n => n.type === filter);

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">📢 Announcements</h2>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            {["all","info","warning","urgent","success"].map(t => (
              <button key={t} className={`tab ${filter === t ? "active" : ""}`} onClick={() => setFilter(t)} style={{ textTransform: "capitalize" }}>{t}</button>
            ))}
          </div>
          {(user.role === "admin" || user.role === "teacher") && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Post</button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        {filtered.length === 0 && (
          <div className="card empty"><div className="empty-icon">🔔</div><p>No announcements</p></div>
        )}
        {filtered.map(n => {
          const cfg = typeConfig[n.type] || typeConfig.info;
          return (
            <div key={n._id} className="card" style={{ background: cfg.bg, borderColor: cfg.border, display: "flex", gap: 16 }}>
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{cfg.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{n.title}</p>
                  <span className={`badge ${cfg.badge}`}>{n.type}</span>
                  {n.module === "hostel" && (
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>🏠 Hostel</span>
                  )}
                </div>
                <p style={{ fontSize: "0.875rem", color: "var(--text2)", lineHeight: 1.6 }}>{n.message}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 8 }}>
                  📅 {new Date(n.createdAt || Date.now()).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post Announcement</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={create}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Title</label>
                <input required placeholder="Announcement title" onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Type</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea required rows={4} placeholder="Write your announcement..." onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">Post Announcement</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
