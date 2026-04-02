import { useEffect, useState, useRef } from "react";
import API from "../api";

const CATALOG = [
  { title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262033848", genre: "CS" },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", genre: "CS" },
  { title: "The Pragmatic Programmer", author: "Hunt & Thomas", isbn: "978-0135957059", genre: "CS" },
  { title: "Engineering Mathematics", author: "B.S. Grewal", isbn: "978-8174091955", genre: "Math" },
  { title: "Physics for Scientists", author: "Serway & Jewett", isbn: "978-1133947271", genre: "Physics" },
  { title: "Organic Chemistry", author: "Morrison & Boyd", isbn: "978-8177583977", genre: "Chemistry" },
  { title: "Data Structures in C", author: "Tanenbaum", isbn: "978-0131997462", genre: "CS" },
  { title: "Operating System Concepts", author: "Silberschatz", isbn: "978-1118063330", genre: "CS" },
  { title: "Database System Concepts", author: "Korth & Sudarshan", isbn: "978-0073523323", genre: "CS" },
  { title: "Computer Networks", author: "Andrew Tanenbaum", isbn: "978-0132126953", genre: "CS" },
];

export default function Library({ user }) {
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("catalog");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");

  // Digital Library state
  const [running, setRunning]         = useState(false);
  const [elapsed, setElapsed]         = useState(0);      // seconds this session
  const [todayTotal, setTodayTotal]   = useState(0);      // seconds saved today
  const [leaderboard, setLeaderboard] = useState([]);
  const [subject, setSubject]         = useState("");
  const timerRef = useRef(null);
  const saveRef  = useRef(null);

  useEffect(() => {
    API.get("/library").then(r => setRequests(r.data)).catch(() => {});
    if (user.role === "student") {
      API.get("/study/me").then(r => setTodayTotal(r.data.seconds || 0)).catch(() => {});
    }
    API.get("/study/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {});
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      // Auto-save every 30 seconds
      saveRef.current = setInterval(() => saveTime(30), 30000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(saveRef.current);
    }
    return () => { clearInterval(timerRef.current); clearInterval(saveRef.current); };
  }, [running]);

  const saveTime = async (secs) => {
    if (secs <= 0) return;
    try {
      const res = await API.post("/study", { seconds: secs });
      setTodayTotal(res.data.seconds || 0);
      API.get("/study/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {});
    } catch {}
  };

  const startTimer  = () => { if (!running) setRunning(true); };
  const pauseTimer  = () => { setRunning(false); };
  const stopTimer   = async () => {
    setRunning(false);
    if (elapsed > 0) {
      await saveTime(elapsed);
      setElapsed(0);
    }
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const medal = (i) => ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;

  const requestBook = async (book) => {
    try {
      const res = await API.post("/library", {
        bookTitle: book.title, author: book.author, isbn: book.isbn,
        studentName: user.name, requestType: "issue",
      });
      setRequests([res.data, ...requests]);
      setModal(null);
      alert("Book request submitted! Collect from library within 2 days.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to request book");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/library/${id}`, { status });
      setRequests(requests.map(r => r._id === id ? res.data : r));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update");
    }
  };

  const isRequested = (isbn) => requests.some(r => r.isbn === isbn && r.status !== "returned" && r.status !== "rejected");

  const filtered = CATALOG.filter(b =>
    (genre === "all" || b.genre === genre) &&
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (s) => ({ pending: "badge-warning", approved: "badge-info", returned: "badge-success", rejected: "badge-danger" }[s] || "badge-gray");
  const genres = ["all", ...new Set(CATALOG.map(b => b.genre))];

  const isOverdue = (r) => r.status === "approved" && r.dueDate && new Date(r.dueDate) < new Date();

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">📖 Library</h2>
        <div className="tabs" style={{ margin: 0 }}>
          <button className={`tab ${tab === "catalog" ? "active" : ""}`} onClick={() => setTab("catalog")}>Catalog</button>
          <button className={`tab ${tab === "mybooks" ? "active" : ""}`} onClick={() => setTab("mybooks")}>
            My Books {requests.filter(r => r.status === "approved").length > 0 && `(${requests.filter(r => r.status === "approved").length})`}
          </button>
          {user.role !== "student" && (
            <button className={`tab ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>Manage</button>
          )}
          <button className={`tab ${tab === "digital" ? "active" : ""}`} onClick={() => setTab("digital")}>💻 Digital Library</button>
        </div>
      </div>

      {tab === "catalog" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <input placeholder="🔍 Search books or authors..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.875rem" }} />
            <div className="tabs" style={{ margin: 0 }}>
              {genres.map(g => (
                <button key={g} className={`tab ${genre === g ? "active" : ""}`} onClick={() => setGenre(g)}
                  style={{ textTransform: "capitalize" }}>{g}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {filtered.map(book => {
              const requested = isRequested(book.isbn);
              return (
                <div key={book.isbn} className="card" style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 48, height: 64, borderRadius: 6, flexShrink: 0,
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem"
                  }}>📚</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 2 }}>{book.title}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{book.author}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>ISBN: {book.isbn}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{book.genre}</span>
                      {requested ? (
                        <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>Requested</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => setModal(book)}>Request</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "mybooks" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Book</th><th>Author</th><th>Type</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No book requests</td></tr>}
                {requests.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.bookTitle}</td>
                    <td>{r.author}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.requestType}</td>
                    <td>
                      {r.dueDate ? (
                        <span style={{ color: isOverdue(r) ? "#ef4444" : "#374151" }}>
                          {isOverdue(r) ? "⚠️ " : ""}{new Date(r.dueDate).toLocaleDateString()}
                        </span>
                      ) : "—"}
                    </td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>
                      {r.status === "approved" && (
                        <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, "returned")}>Return</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "manage" && user.role !== "student" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Book</th><th>Type</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No requests</td></tr>}
                {requests.map(r => (
                  <tr key={r._id}>
                    <td>{r.studentName}</td>
                    <td style={{ fontWeight: 500 }}>{r.bookTitle}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.requestType}</td>
                    <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      {r.status === "pending" && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(r._id, "approved")}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, "rejected")}>Reject</button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, "returned")}>Mark Returned</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "digital" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

          {/* ── TIMER PANEL ── */}
          <div style={{ display: "grid", gap: 16 }}>

            {/* Info banner */}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "10px 16px", fontSize: "0.8rem", color: "var(--text3)" }}>
              📚 Start the timer when you begin studying. Your time is saved and counted in today's leaderboard.
            </div>

            {/* Timer card */}
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Session</p>

              {/* Clock display */}
              <div style={{
                fontFamily: "JetBrains Mono, monospace", fontSize: "3.5rem", fontWeight: 800,
                color: running ? "#10b981" : "var(--text)",
                background: "var(--surface2)", borderRadius: 16, padding: "20px 32px",
                display: "inline-block", marginBottom: 20,
                boxShadow: running ? "0 0 30px rgba(16,185,129,0.2)" : "none",
                transition: "all 0.3s",
              }}>
                {fmt(elapsed)}
              </div>

              {/* Subject input */}
              {user.role === "student" && (
                <div style={{ marginBottom: 16 }}>
                  <input
                    placeholder="What are you studying? (optional)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={running}
                    style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.85rem", background: "var(--bg2)", textAlign: "center" }}
                  />
                </div>
              )}

              {/* Controls */}
              {user.role === "student" ? (
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {!running ? (
                    <button className="btn btn-success" onClick={startTimer} style={{ padding: "10px 28px", fontSize: "1rem" }}>
                      ▶️ {elapsed > 0 ? "Resume" : "Start"}
                    </button>
                  ) : (
                    <button className="btn btn-outline" onClick={pauseTimer} style={{ padding: "10px 28px", fontSize: "1rem" }}>
                      ⏸️ Pause
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={stopTimer} disabled={elapsed === 0} style={{ padding: "10px 28px", fontSize: "1rem" }}>
                    ⏹️ Stop & Save
                  </button>
                </div>
              ) : (
                <p style={{ color: "var(--text3)", fontSize: "0.85rem" }}>Login as student to use the timer</p>
              )}
            </div>

            {/* Today's total */}
            {user.role === "student" && (
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  📚
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Total Study Time</p>
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-light)", lineHeight: 1.2 }}>
                    {fmt(todayTotal + elapsed)}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>Saved: {fmt(todayTotal)} + Current: {fmt(elapsed)}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── LEADERBOARD ── */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>🏆 Today's Leaderboard</p>
              <span style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="empty"><div className="empty-icon">🏆</div><p>No study sessions today yet. Be the first!</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaderboard.map((s, i) => {
                  const isMe = s.studentId === user._id || s.studentId === user.id;
                  const pct  = leaderboard[0]?.seconds ? Math.round((s.seconds / leaderboard[0].seconds) * 100) : 0;
                  return (
                    <div key={s._id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      borderRadius: 12, border: `1px solid ${isMe ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                      background: isMe ? "rgba(99,102,241,0.06)" : "var(--surface2)",
                    }}>
                      {/* Rank */}
                      <span style={{ fontSize: i < 3 ? "1.4rem" : "0.85rem", fontWeight: 700, minWidth: 32, textAlign: "center", color: "var(--text3)" }}>
                        {medal(i)}
                      </span>

                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: i === 0 ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                                  : i === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                                  : i === 2 ? "linear-gradient(135deg, #d97706, #b45309)"
                                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                      }}>
                        {s.studentName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>

                      {/* Name + bar */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: isMe ? 700 : 600, fontSize: "0.85rem", color: isMe ? "var(--primary-light)" : "var(--text)" }}>
                            {s.studentName} {isMe ? "(You)" : ""}
                          </span>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>
                            {fmt(s.seconds)}
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 999, width: `${pct}%`,
                            background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#d97706" : "#6366f1",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="btn btn-outline btn-sm" style={{ marginTop: 14, width: "100%" }}
              onClick={() => API.get("/study/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {})}>
              🔄 Refresh Leaderboard
            </button>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Book</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600 }}>{modal.title}</p>
              <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>{modal.author}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: 4 }}>Due date will be 14 days from today</p>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => requestBook(modal)}>
              Confirm Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
