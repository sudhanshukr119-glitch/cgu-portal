import { useEffect, useState } from "react";
import API from "../api";

const statusColor = due => {
  const d = new Date(due);
  if (d < new Date()) return "badge-danger";
  const diff = (d - new Date()) / 86400000;
  return diff < 3 ? "badge-warning" : "badge-success";
};

const daysLeft = due => {
  const diff = Math.ceil((new Date(due) - new Date()) / 86400000);
  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  return `${diff}d left`;
};

export default function Assignments({ user }) {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [submitModal, setSubmitModal] = useState(null);
  const [gradeModal, setGradeModal]   = useState(null);
  const [createOpen, setCreateOpen]   = useState(false);
  const [form, setForm]   = useState({});
  const [gForm, setGForm] = useState({});
  const [tab, setTab]     = useState("list");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    API.get("/assignments").then(r => setAssignments(r.data)).catch(() => {});
    API.get("/submissions").then(r => setSubmissions(r.data)).catch(() => {});
  }, []);

  const isSubmitted = id => submissions.some(s => s.assignmentId === id);
  const getSubmission = id => submissions.find(s => s.assignmentId === id);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/submissions", { ...form, assignmentId: submitModal._id, studentName: user.name });
      setSubmissions([...submissions, res.data]);
      setSubmitModal(null); setForm({});
    } catch (err) { alert(err?.response?.data?.message || "Error"); }
  };

  const createAssignment = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/assignments", { ...form, teacherId: user._id, teacherName: user.name });
      setAssignments([...assignments, res.data]);
      setForm({}); setCreateOpen(false);
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const gradeSubmission = async (e) => {
    e.preventDefault();
    try {
      const res = await API.put(`/submissions/${gradeModal._id}`, gForm);
      setSubmissions(submissions.map(s => s._id === gradeModal._id ? res.data : s));
      setGradeModal(null); setGForm({});
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const deleteAssignment = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    await API.delete(`/assignments/${id}`).catch(() => {});
    setAssignments(assignments.filter(a => a._id !== id));
  };

  const filteredAssignments = filter === "all" ? assignments
    : filter === "active" ? assignments.filter(a => new Date(a.dueDate) >= new Date())
    : assignments.filter(a => new Date(a.dueDate) < new Date());

  const pendingGrades = submissions.filter(s => !s.marks).length;

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">📝 Assignments
          {user.role === "teacher" && pendingGrades > 0 && <span style={{ color: "#f59e0b" }}>{pendingGrades} to grade</span>}
        </h2>
        <div style={{ display: "flex", gap: 8 }}>
          {user.role === "teacher" && (
            <>
              <div className="tabs" style={{ margin: 0 }}>
                <button className={`tab ${tab === "list" ? "active" : ""}`} onClick={() => setTab("list")}>Assignments</button>
                <button className={`tab ${tab === "submissions" ? "active" : ""}`} onClick={() => setTab("submissions")}>
                  Submissions {pendingGrades > 0 && `(${pendingGrades})`}
                </button>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => setCreateOpen(true)}>+ Create</button>
            </>
          )}
        </div>
      </div>

      {/* ── TEACHER: CREATE FORM ── */}
      {createOpen && user.role === "teacher" && (
        <div className="card" style={{ marginBottom: 20, border: "1px solid var(--primary)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Create New Assignment</h3>
            <button className="modal-close" onClick={() => setCreateOpen(false)}>✕</button>
          </div>
          <form onSubmit={createAssignment}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title</label>
                <input required placeholder="Assignment title" onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Subject</label>
                <input required placeholder="Subject" onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Class / Section</label>
                <input required placeholder="e.g. CS-3A" onChange={e => setForm({ ...form, class: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" required onChange={e => setForm({ ...form, dueDate: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Max Marks</label>
                <input type="number" placeholder="100" onChange={e => setForm({ ...form, maxMarks: Number(e.target.value) })} />
              </div>
            </div>
            <div className="form-group" style={{ marginTop: 12 }}>
              <label>Instructions</label>
              <textarea rows={3} placeholder="Detailed instructions for students..." onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary" type="submit">Create Assignment</button>
              <button className="btn btn-outline" type="button" onClick={() => setCreateOpen(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* ── SUBMISSIONS TAB (teacher) ── */}
      {tab === "submissions" && user.role === "teacher" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Assignment</th><th>Submitted</th><th>Status</th><th>Marks</th><th>Action</th></tr></thead>
              <tbody>
                {submissions.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 40 }}>No submissions yet</td></tr>}
                {submissions.map(s => (
                  <tr key={s._id}>
                    <td style={{ fontWeight: 600 }}>{s.studentName}</td>
                    <td style={{ fontSize: "0.82rem" }}>{assignments.find(a => a._id === s.assignmentId)?.title || "—"}</td>
                    <td style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{new Date(s.createdAt).toLocaleDateString("en-IN")}</td>
                    <td><span className={`badge ${s.marks ? "badge-success" : "badge-warning"}`}>{s.marks ? "Graded" : "Pending"}</span></td>
                    <td style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 700 }}>
                      {s.marks ? `${s.marks}/${assignments.find(a => a._id === s.assignmentId)?.maxMarks || "—"}` : "—"}
                    </td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => { setGradeModal(s); setGForm({ marks: s.marks || "", feedback: s.feedback || "" }); }}>
                        {s.marks ? "Re-grade" : "Grade"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ASSIGNMENT LIST ── */}
      {tab === "list" && (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {["all", "active", "past"].map(f => (
              <button key={f} className={`tab ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)} style={{ textTransform: "capitalize" }}>{f}</button>
            ))}
            <span style={{ marginLeft: "auto", fontSize: "0.8rem", color: "var(--text3)", alignSelf: "center" }}>{filteredAssignments.length} assignments</span>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {filteredAssignments.length === 0 && <div className="card empty"><div className="empty-icon">📝</div><p>No assignments found</p></div>}
            {filteredAssignments.map(a => {
              const sub = getSubmission(a._id);
              const submitted = !!sub;
              const isPast = new Date(a.dueDate) < new Date();
              return (
                <div key={a._id} className="card" style={{ borderLeft: `3px solid ${isPast ? "#ef4444" : submitted ? "#10b981" : "#6366f1"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text)" }}>{a.title}</h3>
                        <span className={`badge ${statusColor(a.dueDate)}`}>{daysLeft(a.dueDate)}</span>
                        {submitted && <span className="badge badge-success">✓ Submitted</span>}
                        {sub?.marks && <span className="badge badge-purple">Marks: {sub.marks}/{a.maxMarks}</span>}
                      </div>
                      <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: 4 }}>
                        📖 {a.subject} · 🏫 {a.class} · 📅 Due: {new Date(a.dueDate).toLocaleDateString("en-IN")} · Max: {a.maxMarks || "—"} marks
                      </p>
                      {a.description && <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginTop: 6, lineHeight: 1.5 }}>{a.description}</p>}
                      {sub?.feedback && <p style={{ fontSize: "0.78rem", color: "#10b981", marginTop: 6, fontStyle: "italic" }}>💬 Feedback: {sub.feedback}</p>}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      {user.role === "student" && !submitted && !isPast && (
                        <button className="btn btn-primary btn-sm" onClick={() => { setSubmitModal(a); setForm({}); }}>Submit</button>
                      )}
                      {user.role === "teacher" && (
                        <button className="btn btn-danger btn-xs" onClick={() => deleteAssignment(a._id)}>Delete</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── SUBMIT MODAL ── */}
      {submitModal && (
        <div className="modal-overlay" onClick={() => setSubmitModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📤 Submit: {submitModal.title}</h3>
              <button className="modal-close" onClick={() => setSubmitModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text3)", marginBottom: 16 }}>
              {submitModal.subject} · Due: {new Date(submitModal.dueDate).toLocaleDateString("en-IN")} · Max Marks: {submitModal.maxMarks}
            </p>
            <form onSubmit={submit}>
              <div className="form-group">
                <label>Your Answer / Work</label>
                <textarea required rows={7} placeholder="Write your answer, paste your solution, or describe your work..." onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">Submit Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* ── GRADE MODAL ── */}
      {gradeModal && (
        <div className="modal-overlay" onClick={() => setGradeModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ Grade Submission</h3>
              <button className="modal-close" onClick={() => setGradeModal(null)}>✕</button>
            </div>
            <div style={{ background: "var(--bg2)", borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: "1px solid var(--border)" }}>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginBottom: 4 }}>Student: <strong style={{ color: "var(--text)" }}>{gradeModal.studentName}</strong></p>
              <p style={{ fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.6 }}>{gradeModal.content}</p>
            </div>
            <form onSubmit={gradeSubmission}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Marks</label>
                  <input required type="number" placeholder="Marks obtained" value={gForm.marks} onChange={e => setGForm({ ...gForm, marks: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Feedback</label>
                <textarea rows={3} placeholder="Write feedback for the student..." value={gForm.feedback} onChange={e => setGForm({ ...gForm, feedback: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">Save Grade</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
