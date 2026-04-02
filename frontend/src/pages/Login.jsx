import { useState } from "react";
import axios from "axios";
import API from "../api";

const EMPTY_SIGNUP = { name: "", email: "", password: "", role: "student", semester: "1", department: "", phone: "" };

const inputBox = (icon, children) => (
  <div style={{ position: "relative" }}>
    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", zIndex: 1, pointerEvents: "none" }}>{icon}</span>
    {children}
  </div>
);

const inputStyle = { paddingLeft: 42, width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, padding: "11px 14px 11px 42px", fontSize: "0.9rem", color: "#fff", fontFamily: "inherit", outline: "none", transition: "border 0.2s, box-shadow 0.2s" };
const selectStyle = { ...inputStyle, cursor: "pointer" };
const labelStyle = { fontSize: "0.72rem", fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 5, display: "block" };

export default function Login({ setPage }) {
  const [tab, setTab] = useState("signin");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);

  const [signupForm, setSignupForm] = useState(EMPTY_SIGNUP);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const [showSignupPass, setShowSignupPass] = useState(false);

  const [focusedField, setFocusedField] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", loginForm);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setPage("dashboard");
    } catch (err) {
      setLoginError(err?.response?.data?.message || "Invalid credentials");
    } finally { setLoginLoading(false); }
  };

  const signup = async (e) => {
    e.preventDefault();
    setSignupLoading(true); setSignupError(""); setSignupSuccess("");
    try {
      await API.post("/auth/register", signupForm);
      setSignupSuccess("Account created! Redirecting to sign in...");
      setSignupForm(EMPTY_SIGNUP);
      setTimeout(() => { setTab("signin"); setSignupSuccess(""); }, 2000);
    } catch (err) {
      setSignupError(err?.response?.data?.message || "Registration failed");
    } finally { setSignupLoading(false); }
  };

  const setL = (k) => (e) => setLoginForm(f => ({ ...f, [k]: e.target.value }));
  const setS = (k) => (e) => setSignupForm(f => ({ ...f, [k]: e.target.value }));

  const getFocusProps = (name) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(""),
    style: { ...inputStyle, ...(focusedField === name ? { borderColor: "#818cf8", boxShadow: "0 0 0 3px rgba(99,102,241,0.2)" } : {}) }
  });

  const getSelectFocusProps = (name) => ({
    onFocus: () => setFocusedField(name),
    onBlur: () => setFocusedField(""),
    style: { ...selectStyle, ...(focusedField === name ? { borderColor: "#818cf8", boxShadow: "0 0 0 3px rgba(99,102,241,0.2)" } : {}) }
  });

  const BRANCHES = ["Computer Science", "Electronics & Communication", "Mechanical", "Civil", "Information Technology", "Electrical", "Chemical", "Biotechnology"];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#07070f", overflow: "hidden", position: "relative" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes floatR { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-12px) rotate(3deg)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes pulse2 { 0%,100%{opacity:0.6} 50%{opacity:1} }
        @keyframes slideInLeft { from{opacity:0;transform:translateX(-40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideInRight { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .auth-input:focus { border-color: #818cf8 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.2) !important; }
        .auth-input::placeholder { color: rgba(255,255,255,0.25); }
        .auth-input option { background: #1a1a2e; color: #fff; }
        .tab-pill { transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .tab-pill:hover { background: rgba(255,255,255,0.08) !important; }
        .demo-row:hover { background: rgba(255,255,255,0.06) !important; }
        .submit-btn { transition: all 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(99,102,241,0.5) !important; }
        .submit-btn:active:not(:disabled) { transform: scale(0.98); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .feature-item { animation: fadeUp 0.5s ease both; }
        .left-panel { animation: slideInLeft 0.6s ease both; }
        .right-panel { animation: slideInRight 0.6s ease both; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 2px; }
      `}</style>

      {/* ── Background orbs ── */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "#6366f1", filter: "blur(120px)", opacity: 0.08, top: -200, left: -100 }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "#8b5cf6", filter: "blur(100px)", opacity: 0.07, bottom: -150, right: -100 }} />
        <div style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: "#06b6d4", filter: "blur(90px)", opacity: 0.05, top: "40%", left: "40%" }} />
        {/* grid */}
        <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(99,102,241,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.8) 1px,transparent 1px)", backgroundSize: "50px 50px" }} />
      </div>

      {/* ══════════ LEFT PANEL ══════════ */}
      <div className="left-panel" style={{ flex: "0 0 48%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 64px", position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 56 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 8px 32px rgba(99,102,241,0.4)", flexShrink: 0 }}>🎓</div>
          <div>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", lineHeight: 1 }}>CGUCampusOne</p>
            <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "2px", marginTop: 3 }}>CGUCampusOne</p>
          </div>
        </div>

        {/* Hero text */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 999, padding: "5px 14px", marginBottom: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", animation: "pulse2 2s infinite", display: "inline-block" }} />
            <span style={{ fontSize: "0.72rem", color: "#818cf8", fontWeight: 600, letterSpacing: "0.5px" }}>Premium College ERP</span>
          </div>
          <h1 style={{ fontSize: "3.2rem", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 16 }}>
            Your Academic<br />
            <span style={{ background: "linear-gradient(135deg,#818cf8,#a78bfa,#c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Universe</span>
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 420 }}>
            One portal for attendance, results, fees, assignments, and everything in between.
          </p>
        </div>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { icon: "📊", label: "Real-time Attendance Tracking", color: "#10b981", delay: "0.1s" },
            { icon: "🏅", label: "Live CGPA & Results Dashboard", color: "#6366f1", delay: "0.2s" },
            { icon: "💳", label: "Fee Management & Payments", color: "#f59e0b", delay: "0.3s" },
            { icon: "📝", label: "Assignments & Submissions", color: "#8b5cf6", delay: "0.4s" },
          ].map((f, i) => (
            <div key={i} className="feature-item" style={{ display: "flex", alignItems: "center", gap: 14, animationDelay: f.delay }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${f.color}18`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>{f.icon}</div>
              <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{f.label}</span>
              <div style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: f.color, opacity: 0.6 }} />
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 32, marginTop: 48, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {[["500+", "Students"], ["50+", "Faculty"], ["20+", "Modules"]].map(([val, lbl]) => (
            <div key={lbl}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{val}</p>
              <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "uppercase", letterSpacing: "1px" }}>{lbl}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL ══════════ */}
      <div className="right-panel" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 48px", position: "relative", zIndex: 1 }}>

        {/* Vertical divider */}
        <div style={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: 1, background: "linear-gradient(to bottom,transparent,rgba(99,102,241,0.3),transparent)" }} />

        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Tab switcher */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 5, marginBottom: 32, position: "relative" }}>
            <div style={{
              position: "absolute", top: 5, bottom: 5,
              left: tab === "signin" ? 5 : "calc(50% + 2px)",
              width: "calc(50% - 7px)",
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              borderRadius: 11,
              boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
            }} />
            {["signin", "signup"].map(t => (
              <button key={t} className="tab-pill" onClick={() => setTab(t)} style={{
                flex: 1, padding: "11px 0", border: "none", background: "none", cursor: "pointer",
                fontSize: "0.9rem", fontWeight: 700, fontFamily: "inherit",
                color: tab === t ? "#fff" : "rgba(255,255,255,0.35)",
                position: "relative", zIndex: 1,
                transition: "color 0.25s ease", borderRadius: 11,
              }}>
                {t === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
              {tab === "signin" ? "Welcome back 👋" : "Join CGU Portal ✨"}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem", marginTop: 6 }}>
              {tab === "signin" ? "Sign in to access your academic dashboard" : "Create your account to get started"}
            </p>
          </div>

          {/* ── SIGN IN FORM ── */}
          {tab === "signin" && (
            <form onSubmit={login}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email Address</label>
                {inputBox("📧",
                  <input className="auth-input" type="email" placeholder="you@college.edu" required
                    value={loginForm.email} onChange={setL("email")} {...getFocusProps("l-email")} />
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", zIndex: 1, pointerEvents: "none" }}>🔒</span>
                  <input className="auth-input" type={showLoginPass ? "text" : "password"} placeholder="••••••••" required
                    value={loginForm.password} onChange={setL("password")} {...getFocusProps("l-pass")}
                    style={{ ...getFocusProps("l-pass").style, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowLoginPass(v => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "rgba(255,255,255,0.4)", zIndex: 1 }}>
                    {showLoginPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {loginError && <ErrorBox msg={loginError} />}

              <button className="submit-btn" type="submit" disabled={loginLoading}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: "0.95rem", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(99,102,241,0.35)" }}>
                {loginLoading ? <><Spin /> Signing in...</> : <>Sign In <span style={{ fontSize: "1rem" }}>→</span></>}
              </button>

              {/* Demo accounts */}
              <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14 }}>
                <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: 10 }}>Quick Demo Access</p>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { role: "Student", email: "student@college.edu", pass: "student123", icon: "🎒", color: "#10b981" },
                    { role: "Teacher", email: "teacher@college.edu", pass: "teacher123", icon: "👨🏫", color: "#6366f1" },
                    { role: "Admin",   email: "admin@college.edu",   pass: "admin123",   icon: "⚙️",  color: "#f59e0b" },
                  ].map(d => (
                    <button key={d.role} type="button" className="demo-row"
                      onClick={() => setLoginForm({ email: d.email, password: d.pass })}
                      style={{ flex: 1, padding: "8px 6px", background: "rgba(255,255,255,0.04)", border: `1px solid ${d.color}25`, borderRadius: 10, cursor: "pointer", textAlign: "center", transition: "all 0.2s", fontFamily: "inherit" }}>
                      <div style={{ fontSize: "1.2rem", marginBottom: 3 }}>{d.icon}</div>
                      <div style={{ fontSize: "0.68rem", color: d.color, fontWeight: 700 }}>{d.role}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ── SIGN UP FORM ── */}
          {tab === "signup" && (
            <form onSubmit={signup} style={{ maxHeight: "calc(100vh - 260px)", overflowY: "auto", paddingRight: 4 }}>

              {/* Row 1: Name + Phone */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  {inputBox("👤", <input className="auth-input" type="text" placeholder="Your full name" required value={signupForm.name} onChange={setS("name")} {...getFocusProps("s-name")} />)}
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  {inputBox("📱", <input className="auth-input" type="tel" placeholder="+91 9876543210" value={signupForm.phone} onChange={setS("phone")} {...getFocusProps("s-phone")} />)}
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email Address</label>
                {inputBox("📧", <input className="auth-input" type="email" placeholder="you@college.edu" required value={signupForm.email} onChange={setS("email")} {...getFocusProps("s-email")} />)}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: "1rem", zIndex: 1, pointerEvents: "none" }}>🔒</span>
                  <input className="auth-input" type={showSignupPass ? "text" : "password"} placeholder="Min. 6 characters" required
                    value={signupForm.password} onChange={setS("password")} {...getFocusProps("s-pass")}
                    style={{ ...getFocusProps("s-pass").style, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowSignupPass(v => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "rgba(255,255,255,0.4)", zIndex: 1 }}>
                    {showSignupPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Row 3: Role + Branch */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={labelStyle}>Role</label>
                  {inputBox("🏷️",
                    <select className="auth-input" value={signupForm.role} onChange={setS("role")} {...getSelectFocusProps("s-role")}>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  )}
                </div>
                <div>
                  <label style={labelStyle}>Branch / Dept</label>
                  {inputBox("🏛️",
                    <select className="auth-input" value={signupForm.department} onChange={setS("department")} {...getSelectFocusProps("s-dept")}>
                      <option value="">Select branch</option>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Semester — only for students */}
              {signupForm.role === "student" && (
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Current Semester</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
                    {[1,2,3,4,5,6,7,8].map(s => (
                      <button key={s} type="button"
                        onClick={() => setSignupForm(f => ({ ...f, semester: String(s) }))}
                        style={{
                          padding: "9px 0", border: "1px solid", borderRadius: 10, cursor: "pointer",
                          fontFamily: "inherit", fontSize: "0.85rem", fontWeight: 700,
                          transition: "all 0.18s",
                          background: signupForm.semester === String(s) ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "rgba(255,255,255,0.04)",
                          borderColor: signupForm.semester === String(s) ? "#6366f1" : "rgba(255,255,255,0.1)",
                          color: signupForm.semester === String(s) ? "#fff" : "rgba(255,255,255,0.4)",
                          boxShadow: signupForm.semester === String(s) ? "0 4px 12px rgba(99,102,241,0.35)" : "none",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.25)", marginTop: 6 }}>Semester {signupForm.semester} selected</p>
                </div>
              )}

              {signupError && <ErrorBox msg={signupError} />}
              {signupSuccess && (
                <div style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)", padding: "11px 14px", borderRadius: 12, fontSize: "0.875rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  ✅ {signupSuccess}
                </div>
              )}

              <button className="submit-btn" type="submit" disabled={signupLoading}
                style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", borderRadius: 12, color: "#fff", fontSize: "0.95rem", fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 6px 20px rgba(99,102,241,0.35)", marginTop: 4 }}>
                {signupLoading ? <><Spin /> Creating account...</> : <>Create Account <span style={{ fontSize: "1rem" }}>→</span></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)", padding: "11px 14px", borderRadius: 12, fontSize: "0.875rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      ⚠️ {msg}
    </div>
  );
}

function Spin() {
  return <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />;
}
