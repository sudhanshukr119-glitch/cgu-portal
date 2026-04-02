import { useEffect, useState } from "react";
import API from "../api";
import Calendar from "../components/Calendar";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { calcSGPA, calcCGPA, groupBySemester } from "../utils/gpa";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#3b82f6"];

const Skeleton = ({ h = 20, w = "100%", r = 8 }) => (
  <div style={{ height: h, width: w, borderRadius: r, background: "var(--surface2)", animation: "pulse 1.5s infinite" }} />
);

/* ─── EXAM COUNTDOWN WIDGET ─── */
function ExamCountdown() {
  const [exams, setExams] = useState([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    API.get("/events").then(r => {
      const upcoming = r.data
        .filter(e => e.category === "exam" && new Date(e.date) > new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);
      setExams(upcoming);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const getCountdown = (date) => {
    const diff = new Date(date) - now;
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, done: true };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { d, h, m, s, done: false };
  };

  if (!exams.length) return null;

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <p className="chart-title" style={{ marginBottom: 14 }}>Upcoming Exam Countdown</p>
      <div style={{ display: "grid", gap: 12 }}>
        {exams.map(exam => {
          const { d, h, m, s, done } = getCountdown(exam.date);
          const urgent = d === 0;
          return (
            <div key={exam._id} style={{
              display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
              padding: "12px 16px", borderRadius: 12,
              background: urgent ? "rgba(239,68,68,0.06)" : "var(--surface2)",
              border: `1px solid ${urgent ? "rgba(239,68,68,0.25)" : "var(--border)"}`,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", marginBottom: 2 }}>{exam.title}</p>
                <div style={{ display: "flex", gap: 10, fontSize: "0.72rem", color: "var(--text3)", flexWrap: "wrap" }}>
                  {exam.venue && <span>{exam.venue}</span>}
                  <span>{new Date(exam.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {exam.time && <span>{exam.time}</span>}
                </div>
              </div>
              {done ? (
                <span className="badge badge-success">Exam Day!</span>
              ) : (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {[[d, "Days"], [h, "Hrs"], [m, "Min"], [s, "Sec"]].map(([val, label]) => (
                    <div key={label} style={{
                      textAlign: "center", minWidth: 44,
                      background: urgent ? "rgba(239,68,68,0.1)" : "var(--surface)",
                      border: `1px solid ${urgent ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                      borderRadius: 8, padding: "6px 8px",
                    }}>
                      <p style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 800, fontSize: "1.1rem", color: urgent ? "#ef4444" : "var(--primary-light)", lineHeight: 1 }}>
                        {String(val).padStart(2, "0")}
                      </p>
                      <p style={{ fontSize: "0.6rem", color: "var(--text3)", marginTop: 2, fontWeight: 600 }}>{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── ADMIN DASHBOARD ─── */
function AdminDashboard({ setActive }) {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [notifCount, setNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const attendanceTrend = [
    { month: "Jan", pct: 82 }, { month: "Feb", pct: 85 }, { month: "Mar", pct: 79 },
    { month: "Apr", pct: 88 }, { month: "May", pct: 91 }, { month: "Jun", pct: 87 },
  ];
  const feeData = [
    { name: "Paid", value: 68 }, { name: "Pending", value: 22 }, { name: "Overdue", value: 10 },
  ];
  const deptData = [
    { dept: "CS", students: 320 }, { dept: "ECE", students: 280 }, { dept: "ME", students: 240 },
    { dept: "Civil", students: 180 }, { dept: "IT", students: 210 },
  ];

  useEffect(() => {
    Promise.all([
      API.get("/users/analytics").catch(() => ({ data: {} })),
      API.get("/users/logs?limit=6").catch(() => ({ data: { logs: [] } })),
      API.get("/notifications").catch(() => ({ data: [] })),
    ]).then(([a, l, n]) => {
      setStats(a.data);
      setLogs(l.data.logs || []);
      setNotifCount(n.data.length || 0);
      setLoading(false);
    });
  }, []);

  const cards = [
    { label: "Total Students", val: stats?.totalStudents ?? "—", icon: "🎓", color: "indigo", key: null },
    { label: "Total Faculty",  val: stats?.totalFaculty  ?? "—", icon: "👨‍🏫", color: "blue",   key: null },
    { label: "Departments",    val: stats?.departments?.length ?? "—", icon: "🏛️", color: "purple", key: null },
    { label: "Active Users",   val: stats?.activeStudents ?? "—", icon: "✅", color: "green",  key: null },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="dash-hero" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #ec4899 100%)" }}>
        <div>
          <p className="dash-hero-sub">Admin Control Panel</p>
          <h1 className="dash-hero-title">System Overview</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: 6 }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[["👤 Add User", "users"], ["📢 Post Notice", "notifications"], ["💳 Fees", "fees"]].map(([label, key]) => (
            <button key={key} className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)", cursor: "pointer" }}
              onClick={() => setActive(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon indigo">🎓</div>
          <div className="stat-info"><p>Total Students</p><h3>{loading ? <Skeleton h={28} w={60} /> : stats?.totalStudents ?? "—"}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👨🏫</div>
          <div className="stat-info"><p>Total Faculty</p><h3>{loading ? <Skeleton h={28} w={60} /> : stats?.totalFaculty ?? "—"}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple">🏛️</div>
          <div className="stat-info"><p>Departments</p><h3>{loading ? <Skeleton h={28} w={60} /> : stats?.departments?.length ?? "—"}</h3></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">✅</div>
          <div className="stat-info"><p>Active Users</p><h3>{loading ? <Skeleton h={28} w={60} /> : stats?.activeStudents ?? "—"}</h3></div>
        </div>
        <div className="stat-card" onClick={() => setActive("fees")} style={{ cursor: "pointer" }}>
          <div className="stat-icon orange">💳</div>
          <div className="stat-info"><p>Fees &amp; Finance</p><h3>→</h3></div>
        </div>
        <div className="stat-card" onClick={() => setActive("notifications")} style={{ cursor: "pointer" }}>
          <div className="stat-icon orange">📢</div>
          <div className="stat-info"><p>Announcements</p><h3>→</h3></div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16, marginBottom: 20 }}>
        {/* Attendance Trend */}
        <div className="card">
          <p className="chart-title">📊 Attendance Trend</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={attendanceTrend}>
              <defs>
                <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[70, 100]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Area type="monotone" dataKey="pct" stroke="#6366f1" strokeWidth={2} fill="url(#aGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Department Students */}
        <div className="card">
          <p className="chart-title">🏛️ Students by Department</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={deptData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="dept" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="students" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee Pie */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <p className="chart-title" style={{ alignSelf: "flex-start" }}>💳 Fee Status</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={feeData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {feeData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            {feeData.map((d, i) => (
              <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem", color: "var(--text3)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i] }} />
                {d.name} {d.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions + Activity Log */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <p className="chart-title">⚡ Quick Actions</p>
          <div className="quick-grid">
            {[
              ["👤", "Manage Users",    "users"],
              ["📊", "Attendance",      "attendance"],
              ["💳", "Fee Management",  "fees"],
              ["📢", "Announcements",   "notifications"],
              ["📝", "Assignments",     "assignments"],
              ["🏅", "Results",         "results"],
              ["🎉", "Events",          "events"],
              ["🔧", "Tech Support",    "tech"],
            ].map(([icon, label, key]) => (
              <div key={key} className="quick-card" onClick={() => setActive(key)}>
                <div className="icon">{icon}</div>
                <p>{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <p className="chart-title">🕐 Recent Activity</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {loading ? [...Array(5)].map((_, i) => <Skeleton key={i} h={44} r={10} />) :
              logs.length === 0 ? <div className="empty"><p>No recent activity</p></div> :
              logs.map((log, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)" }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: log.status === "success" ? "#10b981" : "#ef4444", flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.action}</p>
                    <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{log.userName} · {log.module}</p>
                  </div>
                  <span style={{ fontSize: "0.65rem", color: "var(--text3)", flexShrink: 0 }}>{new Date(log.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TEACHER DASHBOARD ─── */
function TeacherDashboard({ user, setActive }) {
  const [stats, setStats] = useState({ assignments: 0, submissions: 0, attendance: 0, leaves: 0 });
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const perfData = [
    { subject: "Math", avg: 78 }, { subject: "Physics", avg: 82 }, { subject: "CS", avg: 91 },
    { subject: "English", avg: 74 }, { subject: "Chemistry", avg: 68 },
  ];

  useEffect(() => {
    const safe = p => p.catch(() => ({ data: [] }));
    Promise.all([
      safe(API.get("/assignments")),
      safe(API.get("/submissions")),
      safe(API.get("/attendance")),
      safe(API.get("/leaves?status=pending")),
    ]).then(([a, s, att, l]) => {
      setStats({
        assignments: a.data.length,
        submissions: s.data.filter(x => !x.marks).length,
        attendance: att.data.length,
        leaves: l.data.length,
      });
      setLeaves(l.data.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <div className="page">
      <div className="dash-hero" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)" }}>
        <div>
          <p className="dash-hero-sub">Faculty Portal</p>
          <h1 className="dash-hero-title">Welcome, {user.name.split(" ")[0]} 👋</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", marginTop: 6 }}>{user.subject} · {user.designation || "Faculty"}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[["📊 Attendance", "attendance"], ["📝 Assignments", "assignments"], ["🏅 Results", "results"]].map(([l, k]) => (
            <button key={k} className="btn btn-outline" style={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.1)" }}
              onClick={() => setActive(k)}>{l}</button>
          ))}
        </div>
      </div>

      <div className="stat-grid">
        {[
          ["My Assignments", stats.assignments, "📝", "purple"],
          ["Pending Grades", stats.submissions, "⏳", "orange"],
          ["Attendance Records", stats.attendance, "📊", "blue"],
          ["Leave Requests", stats.leaves, "📋", "red"],
        ].map(([label, val, icon, color]) => (
          <div key={label} className="stat-card">
            <div className={`stat-icon ${color}`}>{icon}</div>
            <div className="stat-info"><p>{label}</p><h3>{loading ? "—" : val}</h3></div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card">
          <p className="chart-title">📈 Class Performance by Subject</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={perfData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="subject" tick={{ fill: "var(--text3)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
              <Bar dataKey="avg" radius={[6, 6, 0, 0]}>
                {perfData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <p className="chart-title" style={{ margin: 0 }}>📋 Pending Leave Requests</p>
            <button className="btn btn-outline btn-sm" onClick={() => setActive("leaves")}>View All</button>
          </div>
          {leaves.length === 0
            ? <div className="empty"><div className="empty-icon">✅</div><p>No pending requests</p></div>
            : leaves.map(l => (
              <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8 }}>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{l.studentName}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{l.type} · {l.days} day(s)</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn btn-success btn-xs" onClick={() => API.put(`/leaves/${l._id}/review`, { status: "approved" }).then(() => setLeaves(leaves.filter(x => x._id !== l._id)))}>✓</button>
                  <button className="btn btn-danger btn-xs" onClick={() => API.put(`/leaves/${l._id}/review`, { status: "rejected" }).then(() => setLeaves(leaves.filter(x => x._id !== l._id)))}>✕</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
        {[["📊","Mark Attendance","attendance"],["📝","Assignments","assignments"],["🏅","Enter Marks","results"],["📢","Announce","notifications"],["🗓","Timetable","timetable"],["💬","Messages","chat"]].map(([icon, label, key]) => (
          <div key={key} className="quick-card" onClick={() => setActive(key)}>
            <div className="icon">{icon}</div><p>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── STUDENT DASHBOARD ─── */
function StudentDashboard({ user, setActive }) {
  const [stats, setStats] = useState({ attendance: 0, assignments: 0, fees: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [semData, setSemData] = useState([]);
  const [cgpa, setCgpa] = useState("0.00");

  useEffect(() => {
    const safe = p => p.catch(() => ({ data: [] }));
    Promise.all([
      safe(API.get("/attendance")),
      safe(API.get("/assignments")),
      safe(API.get("/fees")),
      safe(API.get("/events")),
      safe(API.get("/results")),
    ]).then(([att, a, f, e, res]) => {
      const present = att.data.filter(r => r.status === "present" || r.status === "late").length;
      const total = att.data.length;
      setStats({
        attendance: total ? Math.round((present / total) * 100) : 0,
        assignments: a.data.filter(x => new Date(x.dueDate) >= new Date()).length,
        fees: f.data.filter(x => x.status !== "paid").reduce((s, x) => s + (x.amount || 0), 0),
        events: e.data.filter(x => new Date(x.date) >= new Date()).length,
      });
      setEvents(e.data.filter(x => new Date(x.date) >= new Date()).slice(0, 3));
      const semesters = groupBySemester(res.data);
      setSemData(semesters.map(s => ({ sem: `S${s.sem}`, sgpa: parseFloat(calcSGPA(s.items)) })));
      setCgpa(calcCGPA(res.data));
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const attendanceColor = stats.attendance >= 75 ? "#10b981" : stats.attendance >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="page">
      {/* Hero */}
      <div className="dash-hero" style={{ background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: "#fff" }}>
            {user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="dash-hero-sub">{greeting} 👋</p>
            <h1 className="dash-hero-title">{user.name.split(" ")[0]}</h1>
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              {user.class && <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>📚 {user.class}</span>}
              {user.rollNo && <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>🔢 {user.rollNo}</span>}
              {user.semester && <span style={{ background: "rgba(255,255,255,0.2)", color: "#fff", padding: "2px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 600 }}>Sem {user.semester}</span>}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.75rem" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</p>
          <p style={{ color: "#fff", fontSize: "1.4rem", fontWeight: 800, fontFamily: "JetBrains Mono, monospace" }}>{new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" onClick={() => setActive("attendance")} style={{ cursor: "pointer" }}>
          <div className="stat-icon green">📊</div>
          <div className="stat-info">
            <p>Attendance</p>
            <h3 style={{ color: loading ? "var(--text)" : attendanceColor }}>{loading ? "—" : `${stats.attendance}%`}</h3>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActive("assignments")} style={{ cursor: "pointer" }}>
          <div className="stat-icon purple">📝</div>
          <div className="stat-info"><p>Due Assignments</p><h3>{loading ? "—" : stats.assignments}</h3></div>
        </div>
        <div className="stat-card" onClick={() => setActive("fees")} style={{ cursor: "pointer" }}>
          <div className="stat-icon orange">💳</div>
          <div className="stat-info"><p>Pending Fees</p><h3>{loading ? "—" : `₹${stats.fees.toLocaleString()}`}</h3></div>
        </div>
        <div className="stat-card" onClick={() => setActive("events")} style={{ cursor: "pointer" }}>
          <div className="stat-icon blue">🎉</div>
          <div className="stat-info"><p>Upcoming Events</p><h3>{loading ? "—" : stats.events}</h3></div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* SGPA Trend */}
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
            <p className="chart-title" style={{ margin: 0 }}>🏅 SGPA Trend</p>
            <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>CGPA: <strong style={{ color: "var(--primary-light)" }}>{cgpa}</strong></span>
          </div>
          {semData.length === 0
            ? <div className="empty" style={{ height: 160 }}><div className="empty-icon">📭</div><p>No results yet</p></div>
            : <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={semData}>
                  <defs>
                    <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="sem" tick={{ fill: "var(--text3)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
                  <Area type="monotone" dataKey="sgpa" stroke="#10b981" strokeWidth={2} fill="url(#sgpaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
          }
        </div>

        {/* Upcoming Events */}
        <div className="card">
          <div className="section-header" style={{ marginBottom: 12 }}>
            <p className="chart-title" style={{ margin: 0 }}>🎉 Upcoming Events</p>
            <button className="btn btn-outline btn-sm" onClick={() => setActive("events")}>View All</button>
          </div>
          {events.length === 0
            ? <div className="empty"><div className="empty-icon">📅</div><p>No upcoming events</p></div>
            : events.map(ev => (
              <div key={ev._id} style={{ display: "flex", gap: 12, padding: "10px 12px", background: "var(--bg2)", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>🎉</div>
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>{ev.title}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{new Date(ev.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {ev.venue || "Campus"}</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>

      {/* Quick Access */}
      <div className="card" style={{ marginBottom: 16 }}>
        <p className="chart-title">⚡ Quick Access</p>
        <div className="quick-grid">
          {[["🗓","Timetable","timetable"],["📊","Attendance","attendance"],["📝","Assignments","assignments"],["🏅","Results","results"],["📚","Library","library"],["💳","Fees","fees"],["🏥","Medical","dispensary"],["📋","Leave","leaves"],["💬","Messages","chat"],["🔍","Lost & Found","lostfound"]].map(([icon, label, key]) => (
            <div key={key} className="quick-card" onClick={() => setActive(key)}>
              <div className="icon">{icon}</div><p>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <ExamCountdown />

      <Calendar events={events} assignments={[]} />
    </div>
  );
}

/* ─── MAIN HOME EXPORT ─── */
export default function Home({ user, setActive }) {
  if (user?.role === "admin")   return <AdminDashboard setActive={setActive} />;
  if (user?.role === "teacher") return <TeacherDashboard user={user} setActive={setActive} />;
  return <StudentDashboard user={user} setActive={setActive} />;
}
