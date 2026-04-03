import { useState, useEffect, useRef } from "react";
import API from "../api";

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  size: Math.random() * 6 + 3,
  x: Math.random() * 100,
  y: Math.random() * 100,
  dur: Math.random() * 10 + 8,
  delay: Math.random() * 6,
}));

export default function Signup({ setPage }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [focusedField, setFocusedField] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => { setMounted(true); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -10, y: dx * 10 });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

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

  const fields = [
    { key: "name", label: "Full Name", type: "text", placeholder: "Your full name", icon: "👤" },
    { key: "email", label: "Email Address", type: "email", placeholder: "you@college.edu", icon: "📧" },
    { key: "password", label: "Password", type: showPass ? "text" : "password", placeholder: "••••••••", icon: "🔒" },
  ];

  return (
    <div className="login-page with-bg-image" onMouseMove={handleMouseMove} onMouseLeave={resetTilt} style={{
        backgroundImage: "url('/college.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0.4; }
          50%  { opacity: 0.7; }
          100% { transform: translateY(-110vh) scale(0.5); opacity: 0; }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50%       { transform: scale(1.15); opacity: 0.18; }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: perspective(800px) rotateX(12deg) translateY(40px) scale(0.95); }
          to   { opacity: 1; transform: perspective(800px) rotateX(0deg) translateY(0) scale(1); }
        }
        @keyframes fieldIn {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(-50%) scale(1); }
          50%       { transform: translateY(-50%) scale(1.3); }
        }
        .signup-field-wrap { position: relative; }
        .signup-field-wrap:focus-within .field-icon { animation: iconBounce 0.4s ease; }
        .signup-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.2), 0 4px 20px rgba(99,102,241,0.15) !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        .signup-input { transition: all 0.2s ease; }
        .signup-btn {
          background: linear-gradient(90deg, #6366f1, #8b5cf6, #6366f1);
          background-size: 200% auto;
          border: none;
          color: #fff;
          font-weight: 700;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .signup-btn:hover:not(:disabled) {
          animation: shimmer 1.5s linear infinite;
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 8px 30px rgba(99,102,241,0.5);
        }
        .signup-btn:active:not(:disabled) { transform: scale(0.98); }
        .signup-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>

      {/* Dark overlay over college image */}
      <div style={{
        position: "absolute", inset: 0,
        background: "rgba(0,0,0,0.45)",
      }} />



      {/* Floating particles */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {PARTICLES.map((p) => (
          <div key={p.id} style={{
            position: "absolute",
            left: `${p.x}%`, bottom: "-10px",
            width: p.size, height: p.size,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(99,102,241,0.6), rgba(139,92,246,0.6))",
            animation: `floatUp ${p.dur}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }} />
        ))}
      </div>

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />

      {/* 3D Card */}
      <div
        ref={cardRef}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border2)",
          borderRadius: 24,
          padding: 44,
          width: "100%",
          maxWidth: 420,
          position: "relative",
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)`,
          animation: mounted ? "cardIn 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.1s ease",
          willChange: "transform",
        }}
      >
        {/* Glare overlay */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: 24, pointerEvents: "none",
          background: `radial-gradient(circle at ${50 + tilt.y * 3}% ${50 + tilt.x * 3}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
          transition: "background 0.1s ease",
        }} />

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28, animation: "fieldIn 0.5s ease 0.1s both" }}>
          <div style={{
            width: 64, height: 64,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: 18, display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "1.8rem",
            margin: "0 auto 20px",
            boxShadow: "0 8px 32px rgba(99,102,241,0.5), 0 0 0 8px rgba(99,102,241,0.1)",
            animation: "orbPulse 3s ease-in-out infinite",
          }}>🎓</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>
            Create Account
          </h1>
          <p style={{ color: "var(--text3)", fontSize: "0.875rem", marginTop: 6 }}>
            Join CGUCampusOne
          </p>
        </div>

        <form onSubmit={signup}>
          {fields.map(({ key, label, type, placeholder, icon }, i) => (
            <div key={key} className="form-group" style={{
              marginBottom: 14,
              animation: `fieldIn 0.5s ease ${0.2 + i * 0.1}s both`,
            }}>
              <label>{label}</label>
              <div className="signup-field-wrap">
                <span className="field-icon" style={{
                  position: "absolute", left: 12, top: "50%",
                  transform: "translateY(-50%)", fontSize: "0.9rem", zIndex: 1,
                }}>{icon}</span>
                <input
                  className="signup-input"
                  type={type}
                  placeholder={placeholder}
                  required
                  style={{ paddingLeft: 36, paddingRight: key === "password" ? 40 : 12 }}
                  value={form[key]}
                  onChange={set(key)}
                  onFocus={() => setFocusedField(key)}
                  onBlur={() => setFocusedField(null)}
                />
                {key === "password" && (
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text3)", fontSize: "0.85rem" }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Role */}
          <div className="form-group" style={{ marginBottom: 24, animation: "fieldIn 0.5s ease 0.55s both" }}>
            <label>Role</label>
            <div className="signup-field-wrap">
              <span className="field-icon" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", zIndex: 1 }}>🏷️</span>
              <select
                className="signup-input"
                style={{ paddingLeft: 36, width: "100%", background: "var(--bg2)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px 10px 36px", fontSize: "0.9rem" }}
                value={form.role} onChange={set("role")}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", color: "#f87171",
              border: "1px solid rgba(239,68,68,0.2)",
              padding: "10px 14px", borderRadius: 10, fontSize: "0.875rem", marginBottom: 16,
              animation: "fieldIn 0.3s ease",
            }}>⚠️ {error}</div>
          )}

          <div style={{ animation: "fieldIn 0.5s ease 0.65s both" }}>
            <button
              className="signup-btn"
              style={{ width: "100%", padding: "13px", fontSize: "0.95rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Creating account...
                </>
              ) : "Create Account →"}
            </button>
          </div>
        </form>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: "var(--text3)", animation: "fieldIn 0.5s ease 0.75s both" }}>
          Already have an account?{" "}
          <span onClick={() => setPage("login")}
            style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 }}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}
