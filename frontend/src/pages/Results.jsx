import { useEffect, useState } from "react";
import API from "../api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { GRADE_POINTS, calcSGPA, groupBySemester } from "../utils/gpa";

const EXAM_TYPES = ["end-term", "mid-term", "quiz", "assignment", "practical"];
const gradeColor = g => ({ "A+": "#10b981", "A": "#34d399", "B+": "#60a5fa", "B": "#3b82f6", "C+": "#fbbf24", "C": "#f59e0b", "F": "#ef4444" })[g] || "#6366f1";

function StudentResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSem, setActiveSem] = useState(0);

  useEffect(() => {
    API.get("/results")
      .then(r => setResults(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const semesters = groupBySemester(results);
  const currentSemResults = semesters[activeSem]?.items || [];
  const cgpa = calcSGPA(results);
  const sgpa = calcSGPA(currentSemResults);
  const trendData = semesters.map(s => ({ sem: `S${s.sem}`, sgpa: parseFloat(calcSGPA(s.items)) }));

  if (loading) return (
    <div className="page">
      <div className="empty"><div className="empty-icon">⏳</div><p>Loading results...</p></div>
    </div>
  );

  if (!results.length) return (
    <div className="page">
      <div className="section-header"><h2 className="section-title">🏅 Academic Results</h2></div>
      <div className="empty"><div className="empty-icon">📭</div><p>No published results yet</p></div>
    </div>
  );

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🏅 Academic Results</h2>
        <div style={{ display: "flex", gap: 12 }}>
          {[["CGPA", cgpa, "var(--primary-light)"], ["SGPA", sgpa, "#34d399"]].map(([label, val, color]) => (
            <div key={label} style={{ textAlign: "center", background: "var(--surface)", padding: "10px 24px", borderRadius: 12, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.65rem", color: "var(--text3)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>{label}</p>
              <p style={{ fontWeight: 800, fontSize: "1.5rem", color, fontFamily: "JetBrains Mono, monospace", lineHeight: 1.2 }}>{val}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div className="card">
          <p className="chart-title">📈 SGPA Trend</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="sem" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="sgpa" radius={[6, 6, 0, 0]}>
                {trendData.map((_, i) => <Cell key={i} fill={i === activeSem ? "#6366f1" : "#8b5cf6"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <p className="chart-title">📊 Subject Performance (Current Sem)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={currentSemResults.map(r => ({ name: r.subject.split(" ")[0], marks: r.marksObtained }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="name" tick={{ fill: "var(--text3)", fontSize: 10 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="marks" radius={[6, 6, 0, 0]}>
                {currentSemResults.map((r, i) => <Cell key={i} fill={gradeColor(r.grade)} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="tabs">
        {semesters.map((s, i) => (
          <button key={i} className={`tab ${activeSem === i ? "active" : ""}`} onClick={() => setActiveSem(i)}>
            Semester {s.sem}
          </button>
        ))}
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <p style={{ fontWeight: 700, color: "var(--text)" }}>Semester {semesters[activeSem]?.sem}</p>
          <span className="badge badge-purple">SGPA: {sgpa}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Subject</th><th>Exam Type</th><th>Marks</th><th>Grade</th><th>Points</th><th>Performance</th></tr>
            </thead>
            <tbody>
              {currentSemResults.map((r, i) => {
                const pct = Math.round((r.marksObtained / r.totalMarks) * 100);
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: "var(--text)" }}>{r.subject}</td>
                    <td><span className="badge badge-gray" style={{ textTransform: "capitalize" }}>{r.examType}</span></td>
                    <td style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{r.marksObtained}/{r.totalMarks}</td>
                    <td><span style={{ fontWeight: 800, color: gradeColor(r.grade), fontFamily: "JetBrains Mono, monospace" }}>{r.grade}</span></td>
                    <td style={{ fontFamily: "JetBrains Mono, monospace" }}>{GRADE_POINTS[r.grade] ?? 0}</td>
                    <td style={{ minWidth: 140 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1 }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: gradeColor(r.grade) }} />
                        </div>
                        <span style={{ fontSize: "0.72rem", color: "var(--text3)", width: 30 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TeacherResults({ user }) {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState("list");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ examType: "end-term", totalMarks: 100 });
  const [students, setStudents] = useState([]);
  const [publishIds, setPublishIds] = useState([]);

  useEffect(() => {
    API.get("/results").then(r => setResults(r.data)).catch(() => {});
    API.get("/users?role=student&limit=100").then(r => setStudents(r.data.users || [])).catch(() => {});
    API.get("/results/analytics").then(r => setAnalytics(r.data)).catch(() => {});
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/results", form);
      setResults([res.data, ...results]);
      setModal(false);
      setForm({ examType: "end-term", totalMarks: 100 });
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const publish = async () => {
    if (!publishIds.length) return alert("Select results to publish");
    await API.post("/results/publish", { resultIds: publishIds });
    setResults(results.map(r => publishIds.includes(r._id) ? { ...r, isPublished: true } : r));
    setPublishIds([]);
    alert("Results published!");
  };

  const distData = analytics?.distribution
    ? Object.entries(analytics.distribution).map(([grade, count]) => ({ grade, count }))
    : [];

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🏅 Results Management</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {publishIds.length > 0 && <button className="btn btn-success btn-sm" onClick={publish}>📢 Publish ({publishIds.length})</button>}
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Enter Marks</button>
        </div>
      </div>

      {analytics && (
        <div className="stat-grid" style={{ marginBottom: 20 }}>
          {[
            ["Class Average", `${analytics.avg}%`, "blue", "📊"],
            ["Highest", `${analytics.highest}%`, "green", "🏆"],
            ["Lowest", `${analytics.lowest}%`, "red", "📉"],
            ["Pass Rate", `${analytics.total ? Math.round((analytics.pass / analytics.total) * 100) : 0}%`, "purple", "✅"],
          ].map(([label, val, color, icon]) => (
            <div key={label} className="stat-card">
              <div className={`stat-icon ${color}`}>{icon}</div>
              <div className="stat-info"><p>{label}</p><h3>{val}</h3></div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>All Results</button>
        <button className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>
      </div>

      {tab === "list" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={e => setPublishIds(e.target.checked ? results.filter(r => !r.isPublished).map(r => r._id) : [])} /></th>
                  <th>Student</th><th>Subject</th><th>Exam Type</th><th>Marks</th><th>Grade</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No results entered yet</td></tr>}
                {results.map(r => (
                  <tr key={r._id}>
                    <td>{!r.isPublished && <input type="checkbox" checked={publishIds.includes(r._id)} onChange={e => setPublishIds(e.target.checked ? [...publishIds, r._id] : publishIds.filter(id => id !== r._id))} />}</td>
                    <td>
                      <p style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.85rem" }}>{r.studentName}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{r.rollNo} · {r.class}</p>
                    </td>
                    <td>{r.subject}</td>
                    <td><span className="badge badge-gray" style={{ textTransform: "capitalize" }}>{r.examType}</span></td>
                    <td style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>{r.marksObtained}/{r.totalMarks}</td>
                    <td><span style={{ fontWeight: 800, color: gradeColor(r.grade), fontFamily: "JetBrains Mono, monospace" }}>{r.grade}</span></td>
                    <td><span className={`badge ${r.isPublished ? "badge-success" : "badge-warning"}`}>{r.isPublished ? "Published" : "Draft"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "analytics" && (
        <div style={{ display: "grid", gap: 16 }}>
          {/* Filter bar */}
          <div className="card" style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="form-group" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
              <label>Class</label>
              <input placeholder="e.g. CS-3A" onChange={e => {
                API.get(`/results/analytics?class=${e.target.value}`).then(r => setAnalytics(r.data)).catch(() => {});
              }} />
            </div>
            <div className="form-group" style={{ flex: 1, minWidth: 140, marginBottom: 0 }}>
              <label>Subject</label>
              <input placeholder="e.g. Mathematics" onChange={e => {
                API.get(`/results/analytics?subject=${e.target.value}`).then(r => setAnalytics(r.data)).catch(() => {});
              }} />
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => {
              API.get("/results/analytics").then(r => setAnalytics(r.data)).catch(() => {});
            }}>Reset</button>
          </div>

          {!analytics || analytics.total === 0 ? (
            <div className="card empty"><div className="empty-icon">📊</div><p>No published results found for analytics. Publish some results first.</p></div>
          ) : (
            <>
              {/* Stat cards */}
              <div className="stat-grid">
                {[
                  ["Class Average",  `${analytics.avg}%`,   "blue",   "📊"],
                  ["Highest Score",  `${analytics.highest}%`, "green", "🏆"],
                  ["Lowest Score",   `${analytics.lowest}%`,  "red",   "📉"],
                  ["Pass Rate",      `${analytics.total ? Math.round((analytics.pass / analytics.total) * 100) : 0}%`, "purple", "✅"],
                  ["Total Results",  analytics.total,        "orange", "📋"],
                  ["Failed",         analytics.fail,         "red",    "❌"],
                ].map(([label, val, color, icon]) => (
                  <div key={label} className="stat-card">
                    <div className={`stat-icon ${color}`}>{icon}</div>
                    <div className="stat-info"><p>{label}</p><h3>{val}</h3></div>
                  </div>
                ))}
              </div>

              {/* Grade distribution chart */}
              {distData.length > 0 && (
                <div className="card">
                  <p className="chart-title">📊 Grade Distribution</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={distData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis dataKey="grade" tick={{ fill: "var(--text3)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} formatter={v => [v, "Students"]} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {distData.map((d, i) => <Cell key={i} fill={gradeColor(d.grade)} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pass vs Fail pie */}
              <div className="card">
                <p className="chart-title">✅ Pass vs Fail</p>
                <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                  <ResponsiveContainer width={200} height={200}>
                    <BarChart data={[{ name: "Pass", count: analytics.pass }, { name: "Fail", count: analytics.fail }]}>
                      <XAxis dataKey="name" tick={{ fill: "var(--text3)", fontSize: 12 }} />
                      <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, background: "#10b981" }} />
                      <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>Passed: <strong>{analytics.pass}</strong> students ({analytics.total ? Math.round((analytics.pass / analytics.total) * 100) : 0}%)</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, background: "#ef4444" }} />
                      <span style={{ fontSize: "0.9rem", color: "var(--text)" }}>Failed: <strong>{analytics.fail}</strong> students ({analytics.total ? Math.round((analytics.fail / analytics.total) * 100) : 0}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📝 Enter Student Marks</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={create}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Student</label>
                  <select required onChange={e => setForm({ ...form, studentId: e.target.value })}>
                    <option value="">Select student</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNo || s.email})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <input required placeholder="e.g. Mathematics" onChange={e => setForm({ ...form, subject: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Exam Type</label>
                  <select value={form.examType} onChange={e => setForm({ ...form, examType: e.target.value })}>
                    {EXAM_TYPES.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Marks Obtained</label>
                  <input required type="number" min={0} max={form.totalMarks} placeholder="Marks" onChange={e => setForm({ ...form, marksObtained: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Total Marks</label>
                  <input required type="number" value={form.totalMarks} onChange={e => setForm({ ...form, totalMarks: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Remarks</label>
                  <input placeholder="Optional remarks" onChange={e => setForm({ ...form, remarks: e.target.value })} />
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} type="submit">Save Result</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Results({ user }) {
  if (user?.role === "student") return <StudentResults />;
  return <TeacherResults user={user} />;
}
