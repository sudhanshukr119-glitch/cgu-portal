import { useEffect, useState } from "react";
import API from "../api";

export default function Dispensary({ user }) {
  const [records, setRecords] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});

  useEffect(() => { API.get("/dispensary").then(r => setRecords(r.data)).catch(() => {}); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/dispensary", { ...form, studentName: user.name });
      setRecords([res.data, ...records]);
      setModal(false); setForm({});
    } catch (err) { alert(err?.response?.data?.message || "Failed to submit"); }
  };

  const update = async (id, data) => {
    try {
      const res = await API.put(`/dispensary/${id}`, data);
      setRecords(records.map(r => r._id === id ? res.data : r));
    } catch (err) { alert(err?.response?.data?.message || "Failed to update"); }
  };

  const statusBadge = (s) => s === "closed" ? "badge-success" : s === "reviewed" ? "badge-info" : "badge-warning";

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🏥 Dispensary & Medical</h2>
        {user.role === "student" && (
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Request Visit</button>
        )}
      </div>

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {[["Pending", "pending", "orange"], ["Reviewed", "reviewed", "blue"], ["Closed", "closed", "green"]].map(([label, val, color]) => (
          <div key={val} className="stat-card">
            <div className={`stat-icon ${color}`}>{val === "pending" ? "⏳" : val === "reviewed" ? "🔍" : "✅"}</div>
            <div className="stat-info"><p>{label}</p><h3>{records.filter(r => r.status === val).length}</h3></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Student</th><th>Symptoms</th><th>Prescription</th><th>Doctor Note</th><th>Status</th><th>Date</th>
                {user.role !== "student" && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No medical records</td></tr>}
              {records.map(r => (
                <tr key={r._id}>
                  <td>{r.studentName}</td>
                  <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.symptoms}</td>
                  <td>{r.prescription || "—"}</td>
                  <td>{r.doctorNote || "—"}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                  {user.role !== "student" && (
                    <td style={{ display: "flex", gap: 6 }}>
                      {r.status === "pending" && (
                        <button className="btn btn-outline btn-sm" onClick={() => {
                          const prescription = prompt("Prescription:");
                          const doctorNote = prompt("Doctor note:");
                          update(r._id, { status: "reviewed", prescription, doctorNote });
                        }}>Review</button>
                      )}
                      {r.status === "reviewed" && (
                        <button className="btn btn-success btn-sm" onClick={() => update(r._id, { status: "closed" })}>Close</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Medical Visit</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Symptoms / Complaint</label>
                <textarea required rows={4} placeholder="Describe your symptoms..."
                  onChange={e => setForm({ ...form, symptoms: e.target.value })} />
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
