import { useEffect, useState } from "react";
import API from "../api";

const ROLES = ["student", "teacher", "admin"];
const DEPTS = ["Computer Science", "Electronics", "Mechanical", "Civil", "Information Technology"];

export default function Users({ user }) {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null); // null | "create" | user-object
  const [form, setForm]       = useState({});
  const [filters, setFilters] = useState({ role: "", search: "", page: 1 });

  if (user.role !== "admin") return (
    <div className="page"><div className="card empty"><div className="empty-icon">🔒</div><p>Admin access only</p></div></div>
  );

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 15, ...filters });
      const res = await API.get(`/users?${params}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch { setUsers([]); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const save = async (e) => {
    e.preventDefault();
    try {
      if (modal === "create") {
        const res = await API.post("/users", form);
        setUsers([res.data, ...users]);
      } else {
        const res = await API.put(`/users/${modal._id}`, form);
        setUsers(users.map(u => u._id === modal._id ? res.data : u));
      }
      setModal(null); setForm({});
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const deactivate = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;
    await API.delete(`/users/${id}`);
    setUsers(users.map(u => u._id === id ? { ...u, isActive: false } : u));
  };

  const openEdit = (u) => { setModal(u); setForm({ name: u.name, email: u.email, role: u.role, department: u.department, subject: u.subject, class: u.class, rollNo: u.rollNo, semester: u.semester, designation: u.designation }); };

  const roleColor = r => r === "admin" ? "badge-danger" : r === "teacher" ? "badge-info" : "badge-success";

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">👥 User Management <span>{total} total</span></h2>
        <button className="btn btn-primary btn-sm" onClick={() => { setModal("create"); setForm({ role: "student" }); }}>+ Add User</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 16, padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input placeholder="🔍 Search name, email, roll..." style={{ flex: 1, minWidth: 200 }}
            value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          <select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value, page: 1 })} style={{ width: 140 }}>
            <option value="">All Roles</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <button className="btn btn-outline btn-sm" onClick={() => setFilters({ role: "", search: "", page: 1 })}>Reset</button>
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>User</th><th>Role</th><th>Department</th><th>Details</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={7}><div style={{ height: 20, background: "var(--surface2)", borderRadius: 6, animation: "pulse 1.5s infinite" }} /></td></tr>
              ))}
              {!loading && users.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: 40 }}>No users found</td></tr>
              )}
              {!loading && users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar" style={{ width: 32, height: 32, fontSize: "0.72rem", borderRadius: 8 }}>
                        {u.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.85rem" }}>{u.name}</p>
                        <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${roleColor(u.role)}`}>{u.role}</span></td>
                  <td style={{ fontSize: "0.8rem" }}>{u.department || "—"}</td>
                  <td style={{ fontSize: "0.8rem", color: "var(--text3)" }}>
                    {u.role === "student" ? `${u.class || ""} · Roll: ${u.rollNo || "—"}` : u.subject || u.designation || "—"}
                  </td>
                  <td><span className={`badge ${u.isActive ? "badge-success" : "badge-gray"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                  <td style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button className="btn btn-outline btn-xs" onClick={() => openEdit(u)}>Edit</button>
                      {u.isActive && <button className="btn btn-danger btn-xs" onClick={() => deactivate(u._id)}>Deactivate</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 15 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
            <button className="btn btn-outline btn-sm" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>← Prev</button>
            <span style={{ padding: "6px 12px", fontSize: "0.8rem", color: "var(--text3)" }}>Page {filters.page} of {Math.ceil(total / 15)}</span>
            <button className="btn btn-outline btn-sm" disabled={filters.page >= Math.ceil(total / 15)} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>Next →</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modal === "create" ? "➕ Add New User" : `✏️ Edit: ${modal.name}`}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <form onSubmit={save}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input required placeholder="Full name" value={form.name || ""} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input required type="email" placeholder="email@college.edu" value={form.email || ""} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                {modal === "create" && (
                  <div className="form-group">
                    <label>Password</label>
                    <input required type="password" placeholder="Min 6 characters" onChange={e => setForm({ ...form, password: e.target.value })} />
                  </div>
                )}
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role || "student"} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <select value={form.department || ""} onChange={e => setForm({ ...form, department: e.target.value })}>
                    <option value="">Select department</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input placeholder="Phone number" value={form.phone || ""} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
                {(form.role === "student" || !form.role) && <>
                  <div className="form-group">
                    <label>Class / Section</label>
                    <input placeholder="e.g. CS-3A" value={form.class || ""} onChange={e => setForm({ ...form, class: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Roll Number</label>
                    <input placeholder="e.g. CS001" value={form.rollNo || ""} onChange={e => setForm({ ...form, rollNo: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <select value={form.semester || 1} onChange={e => setForm({ ...form, semester: Number(e.target.value) })}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </>}
                {form.role === "teacher" && <>
                  <div className="form-group">
                    <label>Subject</label>
                    <input placeholder="e.g. Mathematics" value={form.subject || ""} onChange={e => setForm({ ...form, subject: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <input placeholder="e.g. Assistant Professor" value={form.designation || ""} onChange={e => setForm({ ...form, designation: e.target.value })} />
                  </div>
                </>}
              </div>
              <button className="btn btn-primary" style={{ marginTop: 20, width: "100%", justifyContent: "center" }} type="submit">
                {modal === "create" ? "Create User" : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
