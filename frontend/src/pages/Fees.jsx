import { useEffect, useState } from "react";
import API from "../api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const FEE_TYPES = ["tuition", "hostel", "exam", "library", "transport", "other"];
const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function Fees({ user }) {
  const [fees, setFees]     = useState([]);
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ type: "tuition", status: "pending" });
  const [students, setStudents] = useState([]);
  const [tab, setTab]       = useState("overview");

  useEffect(() => {
    API.get("/fees").then(r => setFees(r.data)).catch(() => {});
    if (user.role === "admin") {
      API.get("/users?role=student&limit=100").then(r => setStudents(r.data.users || [])).catch(() => {});
    }
  }, []);

  const total   = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid    = fees.filter(f => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0);
  const pending = fees.filter(f => f.status === "pending").reduce((s, f) => s + (f.amount || 0), 0);
  const overdue = fees.filter(f => f.status === "overdue").reduce((s, f) => s + (f.amount || 0), 0);

  const pieData = [
    { name: "Paid",    value: paid },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ].filter(d => d.value > 0);

  const byType = FEE_TYPES.map(t => ({
    type: t,
    amount: fees.filter(f => f.type === t).reduce((s, f) => s + (f.amount || 0), 0)
  })).filter(d => d.amount > 0);

  const markPaid = async (id) => {
    try {
      const res = await API.put(`/fees/${id}`, { status: "paid", paidDate: new Date() });
      setFees(fees.map(f => f._id === id ? res.data : f));
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const createFee = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/fees", form);
      setFees([...fees, res.data]);
      setModal(false); setForm({ type: "tuition", status: "pending" });
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const badgeClass = s => s === "paid" ? "badge-success" : s === "overdue" ? "badge-danger" : "badge-warning";

  const isOverdue = f => f.status !== "paid" && f.dueDate && new Date(f.dueDate) < new Date();

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">💳 Fees & Finance</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {user.role === "admin" && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Add Fee</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`tab ${tab === "records" ? "active" : ""}`} onClick={() => setTab("records")}>Records</button>
        {user.role === "admin" && <button className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            {[["Total Fees", `₹${total.toLocaleString()}`, "blue", "💳"], ["Paid", `₹${paid.toLocaleString()}`, "green", "✅"], ["Pending", `₹${pending.toLocaleString()}`, "orange", "⏳"], ["Overdue", `₹${overdue.toLocaleString()}`, "red", "🚨"]].map(([l, v, c, i]) => (
              <div key={l} className="stat-card"><div className={`stat-icon ${c}`}>{i}</div><div className="stat-info"><p>{l}</p><h3 style={{ fontSize: "1.3rem" }}>{v}</h3></div></div>
            ))}
          </div>

          {total > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Payment Progress</p>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981" }}>{Math.round((paid / total) * 100)}% paid</span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${(paid / total) * 100}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }} />
              </div>
              {overdue > 0 && (
                <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 8 }}>⚠️ ₹{overdue.toLocaleString()} overdue — please clear immediately to avoid penalties</p>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <p className="chart-title">💰 Fee Status Distribution</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="empty"><p>No fee data</p></div>}
            </div>

            <div className="card">
              <p className="chart-title">📊 Fees by Type</p>
              {byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="type" tick={{ fill: "var(--text3)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty"><p>No data</p></div>}
            </div>
          </div>
        </>
      )}

      {/* ── RECORDS ── */}
      {tab === "records" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Semester</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {fees.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 40 }}>No fee records found</td></tr>}
                {fees.map(f => (
                  <tr key={f._id} style={{ background: isOverdue(f) ? "rgba(239,68,68,0.04)" : "transparent" }}>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>
                      {isOverdue(f) && <span style={{ color: "#ef4444", marginRight: 4 }}>⚠️</span>}
                      {f.type}
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>₹{f.amount?.toLocaleString()}</td>
                    <td>{f.semester || "—"}</td>
                    <td style={{ color: isOverdue(f) ? "#ef4444" : "var(--text2)" }}>
                      {f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td><span className={`badge ${badgeClass(f.status)}`}>{f.status}</span></td>
                    <td>
                      {f.status !== "paid" && (user.role === "admin" || user.role === "student") && (
                        <button className="btn btn-success btn-sm" onClick={() => markPaid(f._id)}>Mark Paid</button>
                      )}
                      {f.status === "paid" && (
                        <span style={{ color: "#10b981", fontSize: "0.8rem" }}>✓ {f.paidDate ? new Date(f.paidDate).toLocaleDateString("en-IN") : "Paid"}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADMIN ANALYTICS ── */}
      {tab === "analytics" && user.role === "admin" && (
        <div className="card">
          <p className="chart-title">📊 Collection Summary</p>
          <div className="stat-grid">
            {[["Total Collected", `₹${paid.toLocaleString()}`, "green"], ["Outstanding", `₹${(pending + overdue).toLocaleString()}`, "orange"], ["Collection Rate", `${total ? Math.round((paid / total) * 100) : 0}%`, "blue"]].map(([l, v, c]) => (
              <div key={l} className="stat-card"><div className={`stat-icon ${c}`}>💰</div><div className="stat-info"><p>{l}</p><h3 style={{ fontSize: "1.2rem" }}>{v}</h3></div></div>
            ))}
          </div>
        </div>
      )}

      {/* ── ADD FEE MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Fee Record</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={createFee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Student</label>
                  <select required onChange={e => setForm({ ...form, studentId: e.target.value, studentName: students.find(s => s._id === e.target.value)?.name })}>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.class})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fee Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {FEE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" required placeholder="e.g. 25000" onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input placeholder="e.g. Sem 3" onChange={e => setForm({ ...form, semester: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} type="submit">Add Fee Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
