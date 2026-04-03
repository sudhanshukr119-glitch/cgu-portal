import { useState, useRef, useEffect } from "react";
import API from "../api";

const SUGGESTIONS = [
  "What are the attendance rules?",
  "Explain the fee payment policy",
  "What is the exam eligibility criteria?",
  "Hostel rules and regulations",
  "Library borrowing policy",
  "Disciplinary rules",
  "Leave application process",
  "Anti-ragging policy",
];

function BotMessage({ text }) {
  // Render **bold** and newlines
  return (
    <span style={{ whiteSpace: "pre-wrap" }}>
      {text.split(/\*\*(.*?)\*\*/g).map((p, i) =>
        i % 2 === 1 ? <strong key={i}>{p}</strong> : p
      )}
    </span>
  );
}

// ── Admin: PDF Upload Panel ──────────────────────────────────────────────────
function AdminPanel({ onClose }) {
  const [sources, setSources]   = useState([]);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus]     = useState("");
  const fileRef = useRef(null);

  useEffect(() => { loadSources(); }, []);

  const loadSources = () =>
    API.get("/chatbot/sources").then(r => setSources(r.data)).catch(() => {});

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".pdf")) return setStatus("❌ Only PDF files are supported.");
    setUploading(true);
    setStatus("⏳ Parsing and indexing PDF...");
    try {
      const fd = new FormData();
      fd.append("pdf", file);
      const res = await API.post("/chatbot/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setStatus(`✅ ${res.data.message}`);
      loadSources();
    } catch (err) {
      setStatus(`❌ ${err?.response?.data?.message || "Upload failed"}`);
    } finally {
      setUploading(false);
      fileRef.current.value = "";
    }
  };

  const handleDelete = async (source) => {
    if (!window.confirm(`Delete "${source}"?`)) return;
    await API.delete(`/chatbot/sources/${encodeURIComponent(source)}`);
    loadSources();
    setStatus(`🗑️ Deleted "${source}"`);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      backdropFilter: "blur(4px)", zIndex: 1100,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border2)",
        borderRadius: 20, padding: 28, width: 480, maxHeight: "80vh",
        overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
        animation: "slideUp 0.25s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>🧠 Knowledge Base Manager</p>
          <button onClick={onClose} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, width: 30, height: 30, cursor: "pointer", color: "var(--text3)", fontSize: "0.9rem" }}>✕</button>
        </div>

        {/* Upload */}
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          style={{
            border: "2px dashed var(--border2)", borderRadius: 12, padding: "24px 16px",
            textAlign: "center", cursor: uploading ? "not-allowed" : "pointer",
            background: "var(--bg2)", marginBottom: 16, transition: "border-color 0.2s",
          }}
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); if (!uploading) { fileRef.current.files = e.dataTransfer.files; handleUpload({ target: { files: e.dataTransfer.files } }); } }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📄</div>
          <p style={{ fontSize: "0.85rem", color: "var(--text2)", fontWeight: 600 }}>
            {uploading ? "Processing..." : "Click or drag & drop a PDF"}
          </p>
          <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 4 }}>College handbook, rules & regulations (max 20MB)</p>
        </div>
        <input ref={fileRef} type="file" accept=".pdf" style={{ display: "none" }} onChange={handleUpload} />

        {status && (
          <p style={{ fontSize: "0.8rem", color: status.startsWith("✅") ? "#34d399" : status.startsWith("❌") ? "#f87171" : "var(--text3)", marginBottom: 14, padding: "8px 12px", background: "var(--surface2)", borderRadius: 8 }}>
            {status}
          </p>
        )}

        {/* Indexed sources */}
        <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
          Indexed Documents ({sources.length})
        </p>
        {sources.length === 0 && (
          <p style={{ fontSize: "0.82rem", color: "var(--text3)", textAlign: "center", padding: "16px 0" }}>No PDFs indexed yet</p>
        )}
        {sources.map(s => (
          <div key={s._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface2)", borderRadius: 10, marginBottom: 8 }}>
            <span style={{ fontSize: "1.1rem" }}>📄</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s._id}</p>
              <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{s.chunks} chunks · {new Date(s.updatedAt).toLocaleDateString()}</p>
            </div>
            <button onClick={() => handleDelete(s._id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", borderRadius: 6, padding: "3px 8px", cursor: "pointer", fontSize: "0.72rem", fontFamily: "inherit" }}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Chatbot ─────────────────────────────────────────────────────────────
export default function Chatbot({ user }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "👋 Hi! I'm **CGU Assistant**, trained on your college handbook.\n\nAsk me about rules, regulations, fees, attendance policies, and more!" },
  ]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 120); }, [open]);

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setMessages(prev => [...prev, { id: Date.now(), from: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const res = await API.post("/chatbot/ask", { question: q });
      setMessages(prev => [...prev, { id: Date.now() + 1, from: "bot", text: res.data.answer }]);
    } catch (err) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      setMessages(prev => [...prev, { id: Date.now() + 1, from: "bot", text: `❌ ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <>
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        title="CGU Assistant"
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1000,
          width: 56, height: 56, borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", cursor: "pointer",
          boxShadow: "0 8px 28px rgba(99,102,241,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", transition: "transform 0.2s",
          transform: open ? "rotate(15deg) scale(1.05)" : "scale(1)",
        }}
      >
        {open ? "✕" : "🤖"}
      </button>

      {/* Chat window */}
      {open && (
        <div style={{
          position: "fixed", bottom: 96, right: 28, zIndex: 999,
          width: 370, maxHeight: 560,
          background: "var(--surface)", border: "1px solid var(--border2)",
          borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column", overflow: "hidden",
          animation: "slideUp 0.25s ease",
        }}>

          {/* Header */}
          <div style={{
            padding: "13px 16px", borderBottom: "1px solid var(--border)",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{ fontSize: "1.3rem" }}>🤖</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>CGU Assistant</p>
              <p style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.75)" }}>● RAG · Trained on college handbook</p>
            </div>
            {isAdmin && (
              <button onClick={() => setShowAdmin(true)} title="Manage Knowledge Base"
                style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ⚙️
              </button>
            )}
            <button onClick={() => setOpen(false)}
              style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px 8px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: "flex", flexDirection: msg.from === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                {msg.from === "bot" && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "82%", padding: "9px 13px",
                  borderRadius: msg.from === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                  background: msg.from === "user" ? "linear-gradient(135deg, var(--primary), #8b5cf6)" : "var(--surface2)",
                  color: msg.from === "user" ? "#fff" : "var(--text2)",
                  fontSize: "0.81rem", lineHeight: 1.6,
                  boxShadow: msg.from === "user" ? "0 4px 12px rgba(99,102,241,0.3)" : "none",
                }}>
                  <BotMessage text={msg.text} />
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem" }}>🤖</div>
                <div style={{ padding: "10px 14px", background: "var(--surface2)", borderRadius: "14px 14px 14px 4px", display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text3)", display: "inline-block", animation: "pulse 1.2s ease infinite", animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips — only on first open */}
          {messages.length <= 1 && (
            <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 5 }}>
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} style={{
                  padding: "4px 10px", borderRadius: 999, fontSize: "0.68rem", fontWeight: 600,
                  background: "var(--surface2)", border: "1px solid var(--border2)",
                  color: "var(--text3)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border2)"; e.currentTarget.style.color = "var(--text3)"; }}
                >{s}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask about rules, fees, policies..."
              disabled={loading}
              style={{ flex: 1, padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: "0.82rem" }}
            />
            <button onClick={() => send()} disabled={loading || !input.trim()} className="btn btn-primary btn-sm" style={{ padding: "8px 14px", opacity: loading || !input.trim() ? 0.5 : 1 }}>↑</button>
          </div>
        </div>
      )}
    </>
  );
}
