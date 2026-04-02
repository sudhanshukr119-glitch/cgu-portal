import { useState } from "react";
import API from "../api";

export default function Signup({ setPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const signup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/register", form);
      setPage("login");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-orb" style={{ width: 500, height: 500, background: "#6366f1", top: -200, left: -100 }} />
        <div className="login-orb" style={{ width: 400, height: 400, background: "#8b5cf6", bottom: -150, right: -100 }} />
        <div className="login-orb" style={{ width: 300, height: 300, background: "#f59e0b", bottom: 100, left: "40%" }} />
      </div>

      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none"
      }} />

      <div className="login-card">
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 18, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.8rem",
            margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(99,102,241,0.4)"
          }}>🎓</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
            Create Account
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "0.875rem", marginTop: 6 }}>
            Join CGUCampusOne
          </p>
        </div>

        <form onSubmit={signup}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Full Name</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem" }}>👤</span>
              <input type="text" placeholder="Your full name" required style={{ paddingLeft: 36 }}
                value={form.name} onChange={set("name")} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Email Address</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem" }}>📧</span>
              <input type="email" placeholder="you@college.edu" required style={{ paddingLeft: 36 }}
                value={form.email} onChange={set("email")} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Password</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem" }}>🔒</span>
              <input type={showPass ? "text" : "password"} placeholder="••••••••" required
                style={{ paddingLeft: 36, paddingRight: 40 }}
                value={form.password} onChange={set("password")} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: "0.85rem" }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Role</label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem" }}>🏷️</span>
              <select style={{ paddingLeft: 36, width: "100%", background: "var(--bg2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px 10px 36px", fontSize: "0.9rem" }}
                value={form.role} onChange={set("role")}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
              padding: "10px 14px", borderRadius: 10, fontSize: "0.875rem", marginBottom: 16
            }}>⚠️ {error}</div>
          )}

          <button className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.95rem" }}
            type="submit" disabled={loading}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ animation: "pulse 1s infinite" }}>⏳</span> Creating account...
              </span>
            ) : "Create Account →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "var(--text3)" }}>
          Already have an account?{" "}
          <span onClick={() => setPage("login")}
            style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: 600 }}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
