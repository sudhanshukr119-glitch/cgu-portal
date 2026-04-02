import { useEffect, useState } from "react";
import API from "../api";

const DOCTORS = [
  { id: 1,  name: "Dr. Ramesh Gupta",      specialization: "General Physician",    qualification: "MBBS, MD",          experience: 15, available: "Mon–Sat  9AM–1PM",  room: "Dispensary Room 1", phone: "919876501001", emergency: true  },
  { id: 2,  name: "Dr. Sunita Sharma",     specialization: "Gynaecologist",        qualification: "MBBS, MS (OBG)",    experience: 12, available: "Mon, Wed, Fri  2PM–4PM", room: "Room 3", phone: "919876501002", emergency: false },
  { id: 3,  name: "Dr. Anil Verma",        specialization: "Dentist",              qualification: "BDS, MDS",          experience: 10, available: "Tue, Thu  10AM–12PM", room: "Dental Room", phone: "919876501003", emergency: false },
  { id: 4,  name: "Dr. Priya Nair",        specialization: "Psychiatrist",         qualification: "MBBS, MD (Psych)",  experience: 8,  available: "Mon, Wed  3PM–5PM",  room: "Room 5", phone: "919876501004", emergency: false },
  { id: 5,  name: "Dr. Suresh Pillai",     specialization: "Orthopaedic Surgeon",  qualification: "MBBS, MS (Ortho)",  experience: 18, available: "Tue, Fri  9AM–11AM", room: "Room 2", phone: "919876501005", emergency: true  },
  { id: 6,  name: "Dr. Meena Krishnan",    specialization: "Dermatologist",        qualification: "MBBS, MD (Derma)",  experience: 9,  available: "Wed, Sat  11AM–1PM", room: "Room 4", phone: "919876501006", emergency: false },
  { id: 7,  name: "Dr. Rajiv Tiwari",      specialization: "ENT Specialist",       qualification: "MBBS, MS (ENT)",    experience: 11, available: "Mon, Thu  2PM–4PM",  room: "Room 6", phone: "919876501007", emergency: false },
  { id: 8,  name: "Dr. Kavitha Reddy",     specialization: "Ophthalmologist",      qualification: "MBBS, MS (Ophth)",  experience: 7,  available: "Tue, Sat  10AM–12PM", room: "Room 7", phone: "919876501008", emergency: false },
  { id: 9,  name: "Dr. Mohan Das",         specialization: "Cardiologist",         qualification: "MBBS, DM (Cardio)", experience: 20, available: "Fri  9AM–11AM",       room: "Room 8", phone: "919876501009", emergency: true  },
  { id: 10, name: "Dr. Ananya Bhatt",      specialization: "Physiotherapist",      qualification: "BPT, MPT",          experience: 6,  available: "Mon–Fri  8AM–10AM",  room: "Physio Room", phone: "919876501010", emergency: false },
];

const SPEC_COLORS = {
  "General Physician":   { bg: "rgba(99,102,241,0.1)",  color: "#6366f1",  icon: "👨‍⚕️" },
  "Gynaecologist":       { bg: "rgba(236,72,153,0.1)",  color: "#ec4899",  icon: "👩‍⚕️" },
  "Dentist":             { bg: "rgba(20,184,166,0.1)",  color: "#14b8a6",  icon: "🦷" },
  "Psychiatrist":        { bg: "rgba(139,92,246,0.1)",  color: "#8b5cf6",  icon: "🧠" },
  "Orthopaedic Surgeon": { bg: "rgba(245,158,11,0.1)",  color: "#f59e0b",  icon: "🦴" },
  "Dermatologist":       { bg: "rgba(239,68,68,0.1)",   color: "#ef4444",  icon: "🧤" },
  "ENT Specialist":      { bg: "rgba(59,130,246,0.1)",  color: "#3b82f6",  icon: "👂" },
  "Ophthalmologist":     { bg: "rgba(16,185,129,0.1)",  color: "#10b981",  icon: "👁️" },
  "Cardiologist":        { bg: "rgba(239,68,68,0.1)",   color: "#ef4444",  icon: "❤️" },
  "Physiotherapist":     { bg: "rgba(34,197,94,0.1)",   color: "#22c55e",  icon: "🧘" },
};

const WaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.186-1.443A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.724.868.936-3.42-.235-.372A9.818 9.818 0 1112 21.818z"/>
  </svg>
);

export default function Dispensary({ user }) {
  const [records, setRecords] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [tab, setTab] = useState("doctors");
  const [search, setSearch] = useState("");

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
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${tab === "doctors" ? "active" : ""}`} onClick={() => setTab("doctors")}>👨⚕️ Doctors</button>
            <button className={`tab ${tab === "records" ? "active" : ""}`} onClick={() => setTab("records")}>My Records</button>
          </div>
          {user.role === "student" && (
            <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Request Visit</button>
          )}
        </div>
      </div>

      {/* ── DOCTORS TAB ── */}
      {tab === "doctors" && (
        <>
          {/* Emergency banner */}
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: "1.4rem" }}>🚨</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: "#f87171", fontSize: "0.875rem" }}>Emergency Contact</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: 2 }}>Campus Medical Emergency: <strong style={{ color: "var(--text)" }}>+91 98765 00000</strong> &nbsp;|&nbsp; Ambulance: <strong style={{ color: "var(--text)" }}>108</strong></p>
            </div>
          </div>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 10, padding: "8px 14px", marginBottom: 20 }}>
            <span style={{ color: "var(--text3)" }}>🔍</span>
            <input placeholder="Search by name or specialization..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.875rem", flex: 1 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {DOCTORS.filter(d =>
              d.name.toLowerCase().includes(search.toLowerCase()) ||
              d.specialization.toLowerCase().includes(search.toLowerCase())
            ).map(doc => {
              const style = SPEC_COLORS[doc.specialization] || { bg: "rgba(99,102,241,0.1)", color: "#6366f1", icon: "👨⚕️" };
              return (
                <div key={doc.id} className="card" style={{ display: "flex", gap: 14, position: "relative" }}>
                  {doc.emergency && (
                    <span style={{ position: "absolute", top: 12, right: 12, fontSize: "0.6rem", fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "2px 6px" }}>EMERGENCY</span>
                  )}
                  {/* Avatar */}
                  <div style={{
                    width: 54, height: 54, borderRadius: 14, flexShrink: 0,
                    background: style.bg, border: `1px solid ${style.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem"
                  }}>{style.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: 2 }}>{doc.name}</p>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: style.bg, color: style.color }}>{doc.specialization}</span>
                    <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 6 }}>{doc.qualification} &nbsp;·&nbsp; {doc.experience} yrs exp</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 3 }}>📍 {doc.room}</p>
                    <p style={{ fontSize: "0.75rem", color: "var(--text3)", marginTop: 3 }}>📅 {doc.available}</p>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      <a href={`https://wa.me/${doc.phone}`} target="_blank" rel="noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, textDecoration: "none", background: "#25D366", color: "#fff", fontSize: "0.72rem", fontWeight: 700 }}>
                        <WaIcon /> WhatsApp
                      </a>
                      <a href={`tel:+${doc.phone}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, textDecoration: "none", background: "var(--surface2)", color: "var(--text)", fontSize: "0.72rem", fontWeight: 700, border: "1px solid var(--border)" }}>
                        📞 Call
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── RECORDS TAB ── */}
      {tab === "records" && (
        <>
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

        </>
      )}

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
