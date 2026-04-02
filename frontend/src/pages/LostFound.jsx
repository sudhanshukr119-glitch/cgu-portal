import { useEffect, useState } from "react";
import API from "../api";

export default function LostFound({ user }) {
  const [posts, setPosts] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ type: "lost" });
  const [filter, setFilter] = useState("all");

  useEffect(() => { API.get("/lostfound").then(r => setPosts(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/lostfound", { ...form, postedBy: user.name });
      setPosts([res.data, ...posts]);
      setModal(false); setForm({ type: "lost" });
    } catch (err) { alert(err?.response?.data?.message || "Failed to post"); }
  };

  const resolve = async (id) => {
    try {
      const res = await API.put(`/lostfound/${id}`, { status: "resolved" });
      setPosts(posts.map(p => p._id === id ? res.data : p));
    } catch (err) { alert(err?.response?.data?.message || "Failed to update"); }
  };

  const remove = async (id) => {
    try {
      await API.delete(`/lostfound/${id}`);
      setPosts(posts.filter(p => p._id !== id));
    } catch (err) { alert(err?.response?.data?.message || "Failed to delete"); }
  };

  const filtered = filter === "all" ? posts : posts.filter(p => p.type === filter || (filter === "open" && p.status === "open"));

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🔍 Lost & Found</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Post Item</button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[
          ["Lost Items",  posts.filter(p => p.type === "lost"  && p.status === "open").length,     "red",   "😢"],
          ["Found Items", posts.filter(p => p.type === "found" && p.status === "open").length,     "green", "😊"],
          ["Recovered",   posts.filter(p => p.status === "resolved").length,                      "blue",  "✅"],
        ].map(([label, val, color, icon]) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info"><p>{label}</p><h3>{val}</h3></div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[["all", "All"], ["lost", "Lost"], ["found", "Found"], ["open", "Open Only"]].map(([val, label]) => (
          <button key={val}
            style={{ padding: "6px 16px", borderRadius: 999, border: "1px solid var(--border)", background: filter === val ? "#4f46e5" : "#fff", color: filter === val ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem" }}
            onClick={() => setFilter(val)}>{label}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
        {filtered.length === 0 && <div className="card empty" style={{ gridColumn: "1/-1" }}><p>No posts found</p></div>}
        {filtered.map(p => (
          <div key={p._id} className="card" style={{ borderLeft: `4px solid ${p.status === "resolved" ? "#10b981" : p.type === "lost" ? "#ef4444" : "#10b981"}`, opacity: p.status === "resolved" ? 0.7 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: "1.3rem" }}>{p.status === "resolved" ? "✅" : p.type === "lost" ? "😢" : "😊"}</span>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                    background: p.status === "resolved" ? "#d1fae5" : p.type === "lost" ? "#fee2e2" : "#d1fae5",
                    color: p.status === "resolved" ? "#065f46" : p.type === "lost" ? "#991b1b" : "#065f46",
                    textTransform: "uppercase"
                  }}>{p.status === "resolved" ? "found" : p.type}</span>
                  {p.status === "resolved" && (
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "#d1fae5", color: "#065f46" }}>
                      ✅ Item Recovered
                    </span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text3)", display: "block" }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                {p.resolvedAt && <span style={{ fontSize: "0.68rem", color: "#10b981", display: "block", marginTop: 2 }}>Recovered {new Date(p.resolvedAt).toLocaleDateString()}</span>}
                {(p.userId === user._id || p.userId === user.id) && (
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "rgba(99,102,241,0.12)", color: "#818cf8", borderRadius: 6, padding: "1px 6px", display: "inline-block", marginTop: 4 }}>My Post</span>
                )}
              </div>
            </div>

            <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{p.itemName}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text2)", marginBottom: 8 }}>{p.description}</p>

            <div style={{ fontSize: "0.78rem", color: "var(--text3)", display: "flex", flexDirection: "column", gap: 3 }}>
              {p.location && <span>📍 {p.location}</span>}
              {p.contact && <span>📞 {p.contact}</span>}
              <span>👤 Posted by {p.postedBy}</span>
            </div>

            {p.status === "open" && (
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                {/* Only owner or admin can mark as found */}
                {(p.userId === user._id || p.userId === user.id || user.role === "admin") && (
                  <button className="btn btn-success btn-sm" onClick={() => resolve(p._id)}>
                    {p.type === "lost" ? "✅ Mark as Found" : "✅ Mark Resolved"}
                  </button>
                )}
                {/* Only owner or admin can delete */}
                {(p.userId === user._id || p.userId === user.id || user.role === "admin") && (
                  <button className="btn btn-danger btn-sm" onClick={() => remove(p._id)}>Delete</button>
                )}
                {/* Other users see a read-only label */}
                {p.userId !== user._id && p.userId !== user.id && user.role !== "admin" && (
                  <span style={{ fontSize: "0.75rem", color: "var(--text3)", alignSelf: "center" }}>Only the owner can resolve this</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post Lost / Found Item</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label>Type</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {["lost", "found"].map(t => (
                    <label key={t} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "8px 16px", borderRadius: 8, border: `2px solid ${form.type === t ? "#4f46e5" : "#e5e7eb"}`, background: form.type === t ? "#ede9fe" : "#fff", flex: 1, justifyContent: "center" }}>
                      <input type="radio" name="type" value={t} checked={form.type === t} onChange={() => setForm({ ...form, type: t })} style={{ display: "none" }} />
                      <span style={{ textTransform: "capitalize", fontWeight: 600, color: form.type === t ? "#4f46e5" : "#374151" }}>
                        {t === "lost" ? "😢 Lost" : "😊 Found"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Item Name</label>
                  <input required placeholder="e.g. Blue water bottle" onChange={e => setForm({ ...form, itemName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input placeholder="e.g. Library, Block B" onChange={e => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  <input placeholder="Phone or email" onChange={e => setForm({ ...form, contact: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Description</label>
                <textarea required rows={3} placeholder="Describe the item..." onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">
                Post
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
