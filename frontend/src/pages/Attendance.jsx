import { useEffect, useState } from "react";
import API from "../api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "English", "Computer Science", "Data Structures"];
const pctColor = p => p >= 75 ? "#10b981" : p >= 60 ? "#f59e0b" : "#ef4444";
const statusBadge = s => s === "present" ? "badge-success" : s === "late" ? "badge-warning" : "badge-danger";

export default function Attendance({ user }) {
  const [records, setRecords]     = useState([]);
  const [tab, setTab]             = useState("overview");
  const [filterSubject, setFilterSubject] = useState("all");
  const [markForm, setMarkForm]   = useState({ subject: SUBJECTS[0], date: new Date().toISOString().split("T")[0], status: "present" });
  const [bulkClass, setBulkClass] = useState("");
  const [bulkStudents, setBulkStudents] = useState([]);
  const [students, setStudents]   = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [selfRecords, setSelfRecords] = useState([]);
  const [selfForm, setSelfForm]   = useState({ subject: SUBJECTS[0], date: new Date().toISOString().split("T")[0], status: "present" });

  useEffect(() => {
    API.get("/attendance").then(r => { setRecords(r.data); setLoading(false); }).catch(() => setLoading(false));
    if (user.role === "teacher" || user.role === "admin") {
      API.get("/users?role=student&limit=100").then(r => setStudents(r.data.users || [])).catch(() => {});
    }
    if (user.role === "student") {
      API.get("/attendance/self").then(r => setSelfRecords(r.data)).catch(() => {});
    }
  }, []);

  // Stats
  const present = records.filter(r => r.status === "present" || r.status === "late").length;
  const overall = records.length ? Math.round((present / records.length) * 100) : 0;

  const subjectStats = SUBJECTS.map(sub => {
    const subRecs = records.filter(r => r.subject === sub);
    const p = subRecs.filter(r => r.status === "present" || r.status === "late").length;
    const pct = subRecs.length ? Math.round((p / subRecs.length) * 100) : 0;
    return { sub, total: subRecs.length, present: p, pct };
  });

  const chartData = subjectStats.map(s => ({ name: s.sub.split(" ")[0], pct: s.pct }));
  const filtered  = filterSubject === "all" ? records : records.filter(r => r.subject === filterSubject);

  // Low attendance alert
  const atRisk = subjectStats.filter(s => s.total > 0 && s.pct < 75);

  const markSingle = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/attendance", { ...markForm, studentId: user._id });
      setRecords([res.data, ...records]);
      alert("Attendance marked!");
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const initBulk = () => {
    const cls = students.filter(s => !bulkClass || s.class === bulkClass);
    setBulkStudents(cls.map(s => ({ id: s._id, name: s.name, rollNo: s.rollNo, status: "present" })));
  };

  const submitBulk = async () => {
    if (!bulkStudents.length) return alert("No students loaded");
    setBulkLoading(true);
    try {
      const res = await API.post("/attendance/bulk", {
        records: bulkStudents.map(s => ({
          studentId: s.id,
          studentName: s.name,
          subject: markForm.subject,
          date: markForm.date,
          status: s.status,
        }))
      });
      alert(`Attendance marked for ${res.data.count || bulkStudents.length} students!`);
      setBulkStudents([]);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit bulk attendance");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">📊 Attendance</h2>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
          <button className={`tab ${tab === "records" ? "active" : ""}`} onClick={() => setTab("records")}>Records</button>
          {user.role === "student" && <button className={`tab ${tab === "tracker" ? "active" : ""}`} onClick={() => setTab("tracker")}>📝 My Tracker</button>}
          {(user.role === "teacher" || user.role === "admin") && <>
            <button className={`tab ${tab === "mark" ? "active" : ""}`} onClick={() => setTab("mark")}>Mark Single</button>
            <button className={`tab ${tab === "bulk" ? "active" : ""}`} onClick={() => setTab("bulk")}>Bulk Mark</button>
          </>}
        </div>
      </div>

      {/* Low attendance alert */}
      {user.role === "student" && atRisk.length > 0 && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.2rem" }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 700, color: "#f87171", fontSize: "0.875rem" }}>Low Attendance Alert</p>
            <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: 2 }}>
              You are below 75% in: {atRisk.map(s => `${s.sub} (${s.pct}%)`).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, marginBottom: 20, alignItems: "start" }}>
            {/* Donut */}
            <div className="card" style={{ textAlign: "center", padding: 28 }}>
              <div style={{ width: 110, height: 110, borderRadius: "50%", margin: "0 auto 14px", background: `conic-gradient(${pctColor(overall)} ${overall * 3.6}deg, var(--surface2) 0deg)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 84, height: 84, borderRadius: "50%", background: "var(--surface)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.4rem", color: pctColor(overall), fontFamily: "JetBrains Mono, monospace" }}>{overall}%</div>
              </div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>Overall</p>
              <p style={{ fontSize: "0.75rem", color: pctColor(overall), marginTop: 4 }}>{overall >= 75 ? "✅ Good Standing" : "⚠️ At Risk"}</p>
            </div>

            {/* Subject bars */}
            <div style={{ display: "grid", gap: 8 }}>
              {subjectStats.map(({ sub, total, present, pct }) => (
                <div key={sub} className="card" style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{sub}</span>
                    <span style={{ fontSize: "0.85rem", fontWeight: 800, color: pctColor(pct), fontFamily: "JetBrains Mono, monospace" }}>{pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${pct}%`, background: pctColor(pct) }} />
                  </div>
                  <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginTop: 4 }}>{present}/{total} classes · {pct < 75 ? "⚠️ Below 75%" : "✓ OK"}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            {[["Total", records.length, "blue", "📊"], ["Present", records.filter(r => r.status === "present").length, "green", "✅"], ["Absent", records.filter(r => r.status === "absent").length, "red", "❌"], ["Late", records.filter(r => r.status === "late").length, "orange", "⏰"]].map(([l, v, c, i]) => (
              <div key={l} className="stat-card"><div className={`stat-icon ${c}`}>{i}</div><div className="stat-info"><p>{l}</p><h3>{v}</h3></div></div>
            ))}
          </div>

          {/* Chart */}
          <div className="card">
            <p className="chart-title">📈 Subject-wise Attendance %</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--text3)", fontSize: 11 }} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} formatter={v => [`${v}%`, "Attendance"]} />
                <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                  {chartData.map((d, i) => <Cell key={i} fill={pctColor(d.pct)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── RECORDS ── */}
      {tab === "records" && (
        <div className="card">
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
              <option value="all">All Subjects</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <span style={{ fontSize: "0.8rem", color: "var(--text3)", alignSelf: "center" }}>{filtered.length} records</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Date</th><th>Subject</th><th>Status</th>{(user.role === "teacher" || user.role === "admin") && <th>Student</th>}</tr></thead>
              <tbody>
                {loading && <tr><td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>Loading...</td></tr>}
                {!loading && filtered.length === 0 && <tr><td colSpan={4} style={{ textAlign: "center", padding: 32, color: "var(--text3)" }}>No records found</td></tr>}
                {!loading && filtered.map(r => (
                  <tr key={r._id}>
                    <td>{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</td>
                    <td>{r.subject}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`} style={{ textTransform: "capitalize" }}>{r.status}</span></td>
                    {(user.role === "teacher" || user.role === "admin") && <td style={{ fontSize: "0.8rem" }}>{r.studentName || "—"}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MY TRACKER ── */}
      {tab === "tracker" && user.role === "student" && (
        <div style={{ display: "grid", gap: 20 }}>
          {/* info banner */}
          <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "10px 16px", fontSize: "0.8rem", color: "var(--text3)" }}>
            ℹ️ This is your <strong>personal tracker only</strong>. It does not affect the official attendance recorded by your teacher.
          </div>

          {/* log form */}
          <div className="card" style={{ maxWidth: 480 }}>
            <h3 style={{ marginBottom: 14, fontSize: "0.95rem", color: "var(--text)" }}>Log Today's Attendance</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>Subject</label>
                <select value={selfForm.subject} onChange={e => setSelfForm({ ...selfForm, subject: e.target.value })}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={selfForm.date} max={new Date().toISOString().split("T")[0]} onChange={e => setSelfForm({ ...selfForm, date: e.target.value })} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              {["present", "absent"].map(st => (
                <button key={st} onClick={() => setSelfForm({ ...selfForm, status: st })}
                  className={`btn ${selfForm.status === st ? (st === "present" ? "btn-success" : "btn-danger") : "btn-outline"}`}
                  style={{ flex: 1, textTransform: "capitalize" }}>
                  {st === "present" ? "✅" : "❌"} {st}
                </button>
              ))}
            </div>
            <button className="btn btn-primary" style={{ marginTop: 12, width: "100%" }} onClick={async () => {
              try {
                const res = await API.post("/attendance/self", selfForm);
                setSelfRecords(prev => { const idx = prev.findIndex(r => r.subject === res.data.subject && r.date === res.data.date); return idx >= 0 ? prev.map((r, i) => i === idx ? res.data : r) : [res.data, ...prev]; });
                alert("Logged!");
              } catch { alert("Failed to log"); }
            }}>Save Entry</button>
          </div>

          {/* self records table */}
          <div className="card">
            <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 12, color: "var(--text)" }}>My Logged Entries</p>
            {selfRecords.length === 0
              ? <div className="empty"><div className="empty-icon">📝</div><p>No entries yet. Start logging above.</p></div>
              : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Subject</th><th>Self Status</th></tr></thead>
                    <tbody>
                      {selfRecords.map(r => (
                        <tr key={r._id}>
                          <td>{new Date(r.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</td>
                          <td>{r.subject}</td>
                          <td><span className={`badge ${r.status === "present" ? "badge-success" : "badge-danger"}`} style={{ textTransform: "capitalize" }}>{r.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </div>
        </div>
      )}

      {/* ── MARK SINGLE ── */}
      {tab === "mark" && (user.role === "teacher" || user.role === "admin") && (
        <div className="card" style={{ maxWidth: 520 }}>
          <h3 style={{ marginBottom: 16, fontSize: "0.95rem", color: "var(--text)" }}>Mark Individual Attendance</h3>
          <form onSubmit={markSingle}>
            <div className="form-grid">
              <div className="form-group">
                <label>Student</label>
                <select required onChange={e => setMarkForm({ ...markForm, studentId: e.target.value })}>
                  <option value="">Select student</option>
                  {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.class})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Subject</label>
                <select value={markForm.subject} onChange={e => setMarkForm({ ...markForm, subject: e.target.value })}>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={markForm.date} onChange={e => setMarkForm({ ...markForm, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={markForm.status} onChange={e => setMarkForm({ ...markForm, status: e.target.value })}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 14 }} type="submit">Mark Attendance</button>
          </form>
        </div>
      )}

      {/* ── BULK MARK ── */}
      {tab === "bulk" && (user.role === "teacher" || user.role === "admin") && (
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: "0.95rem", color: "var(--text)" }}>Bulk Attendance Marking</h3>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Subject</label>
              <select value={markForm.subject} onChange={e => setMarkForm({ ...markForm, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Date</label>
              <input type="date" value={markForm.date} onChange={e => setMarkForm({ ...markForm, date: e.target.value })} />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Filter by Class</label>
              <input placeholder="e.g. CS-3A (optional)" value={bulkClass} onChange={e => setBulkClass(e.target.value)} />
            </div>
            <div className="form-group" style={{ justifyContent: "flex-end" }}>
              <label>&nbsp;</label>
              <button className="btn btn-outline" onClick={initBulk}>Load Students</button>
            </div>
          </div>

          {bulkStudents.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text3)" }}>{bulkStudents.length} students loaded</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-success btn-sm" onClick={() => setBulkStudents(bulkStudents.map(s => ({ ...s, status: "present" })))}>All Present</button>
                  <button className="btn btn-danger btn-sm" onClick={() => setBulkStudents(bulkStudents.map(s => ({ ...s, status: "absent" })))}>All Absent</button>
                </div>
              </div>
              <div className="table-wrap" style={{ marginBottom: 16 }}>
                <table>
                  <thead><tr><th>Roll No</th><th>Name</th><th>Status</th></tr></thead>
                  <tbody>
                    {bulkStudents.map((s, i) => (
                      <tr key={s.id}>
                        <td style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.8rem" }}>{s.rollNo || "—"}</td>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {["present", "absent", "late"].map(st => (
                              <button key={st} onClick={() => setBulkStudents(bulkStudents.map((x, j) => j === i ? { ...x, status: st } : x))}
                                className={`btn btn-xs ${s.status === st ? (st === "present" ? "btn-success" : st === "absent" ? "btn-danger" : "btn-outline") : "btn-outline"}`}
                                style={{ textTransform: "capitalize" }}>{st}</button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button className="btn btn-primary" onClick={submitBulk} disabled={bulkLoading}>
                {bulkLoading ? "Submitting..." : `Submit Attendance for ${bulkStudents.length} Students`}
              </button>
            </>
          )}
          {bulkStudents.length === 0 && <div className="empty"><div className="empty-icon">👥</div><p>Click "Load Students" to begin bulk marking</p></div>}
        </div>
      )}
    </div>
  );
}
