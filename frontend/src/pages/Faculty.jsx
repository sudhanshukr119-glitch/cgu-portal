import { useEffect, useState } from "react";
import API from "../api";

const DEPARTMENTS = ["All", "Computer Science", "Electronics", "Mechanical", "Civil", "Electrical"];

// Static faculty list — mirrors DEMO_USERS in Chat.jsx
// Used as fallback so Faculty Directory always shows all 20 teachers even before seeding
const STATIC_FACULTY = [];

// Maps faculty email → WhatsApp number
const PHONE_MAP = Object.fromEntries(STATIC_FACULTY.map(f => [f.email, f.phone]));

const WaIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.186-1.443A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.724.868.936-3.42-.235-.372A9.818 9.818 0 1112 21.818z"/>
  </svg>
);

export default function Faculty({ user, setActive }) {
  const [faculty, setFaculty] = useState([]);
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");

  useEffect(() => {
    API.get("/users/faculty").then(r => setFaculty(r.data)).catch(() => {});
  }, []);

  const filtered = faculty.filter(f =>
    (dept === "All" || f.department?.toLowerCase() === dept.toLowerCase()) &&
    (f.name?.toLowerCase().includes(search.toLowerCase()) ||
     f.subject?.toLowerCase().includes(search.toLowerCase()) ||
     f.department?.toLowerCase().includes(search.toLowerCase()) ||
     f.email?.toLowerCase().includes(search.toLowerCase()))
  );

  const initials = (name) => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const gradients = [
    "linear-gradient(135deg, #6366f1, #8b5cf6)",
    "linear-gradient(135deg, #2563eb, #3b82f6)",
    "linear-gradient(135deg, #059669, #34d399)",
    "linear-gradient(135deg, #dc2626, #f87171)",
    "linear-gradient(135deg, #d97706, #fbbf24)",
    "linear-gradient(135deg, #0891b2, #22d3ee)",
  ];

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">👨‍🏫 Faculty Directory <span>{faculty.length} members</span></h2>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 220 }}>
          <span style={{ color: "var(--text3)" }}>🔍</span>
          <input
            placeholder="Search by name, subject, email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.875rem", flex: 1 }}
          />
        </div>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {DEPARTMENTS.map(d => (
            <button key={d} className={`tab ${dept === d ? "active" : ""}`} onClick={() => setDept(d)}>{d}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && <div className="card empty"><div className="empty-icon">👨‍🏫</div><p>No faculty found</p></div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {filtered.map((f, i) => (
          <div key={f._id} className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start", transition: "all 0.2s" }}>
            <div style={{
              width: 54, height: 54, borderRadius: 14, flexShrink: 0,
              background: gradients[i % gradients.length],
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 800, fontSize: "1.1rem",
              boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
            }}>
              {initials(f.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{f.name}</p>
              <p style={{ color: "var(--text3)", fontSize: "0.8rem", marginTop: 3 }}>
                {f.subject ? `📖 ${f.subject}` : "No subject assigned"}
              </p>
              {f.department && (
                <p style={{ color: "var(--text3)", fontSize: "0.75rem", marginTop: 2 }}>🏛️ {f.department}</p>
              )}
              <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                ✉️ {f.email}
              </p>
              {PHONE_MAP[f.email] && (
                <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: 2 }}>
                  📱 +{PHONE_MAP[f.email].replace(/^91/, "91 ")}
                </p>
              )}
              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span className="badge badge-purple">Faculty</span>
                {f.isHOD && <span style={{ fontSize: "0.6rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "1px 6px" }}>HOD</span>}
                <button className="btn btn-outline btn-xs" onClick={() => setActive("chat", { id: f._id, name: f.name, role: "teacher", branch: f.department || "Other", subject: f.subject || "", hod: f.isHOD || false, online: false })}>Message</button>
                {PHONE_MAP[f.email] && (
                  <a
                    href={`https://wa.me/${PHONE_MAP[f.email]}`}
                    target="_blank"
                    rel="noreferrer"
                    title={`WhatsApp ${f.name}`}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      padding: "3px 9px", borderRadius: 6, textDecoration: "none",
                      background: "#25D366", color: "#fff",
                      fontSize: "0.72rem", fontWeight: 700, fontFamily: "inherit",
                    }}
                  >
                    <WaIcon /> WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
