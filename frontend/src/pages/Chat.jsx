import { useState, useEffect, useRef } from "react";
import API from "../api";

const DEMO_USERS = [
  { id: "adm", name: "Admin Office", role: "admin", branch: "", subject: "", hod: false, online: true, phone: "919876543200" },
];

const DEMO_MESSAGES = {
  adm: [
    { id: 1, from: "adm", text: "Fee payment portal is open. Last date for this semester is 30th.", time: "8:00 AM", own: false },
    { id: 2, from: "me",  text: "Thank you for the reminder.", time: "8:05 AM", own: true },
  ],
};

const QUICK_REPLIES = [
  "Thank you!",
  "I understand",
  "Can you explain more?",
  "Got it, will do.",
  "When is the deadline?",
];

export default function Chat({ user, initialUser }) {
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0]);
  const [messages, setMessages] = useState(DEMO_MESSAGES[DEMO_USERS[0].id] || []);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState(DEMO_USERS);
  const bottomRef = useRef(null);

  useEffect(() => {
    API.get("/users/faculty").then(r => {
      const dbFaculty = r.data.map(f => ({
        id: f._id, name: f.name, role: "teacher",
        branch: f.department || "Other", subject: f.subject || "",
        hod: f.isHOD || false, online: false,
        phone: f.phone ? f.phone.replace(/\D/g, "") : null,
      }));
      const merged = [...DEMO_USERS, ...dbFaculty];
      setAllUsers(merged);
      if (initialUser) {
        const found = merged.find(u => u.id === initialUser.id || u.name === initialUser.name);
        if (found) { setSelectedUser(found); setMessages(DEMO_MESSAGES[found.id] || []); }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setMessages(DEMO_MESSAGES[selectedUser.id] || []);
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (text) => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now(),
      from: "me",
      text: text.trim(),
      time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      own: true,
    };
    setMessages(prev => [...prev, msg]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      const replies = [
        "Understood! Let me know if you need anything else.",
        "Great! I'll get back to you shortly.",
        "Sure, I'll check and respond.",
        "Thanks for reaching out!",
      ];
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        from: selectedUser.id,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        own: false,
      }]);
    }, 1200);
  };

  const filtered = allUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.branch || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.subject || "").toLowerCase().includes(search.toLowerCase())
  );

  const grouped = [...new Set(allUsers.map(u => u.branch || ""))].map(b => ({
    branch: b || "Admin",
    users: filtered.filter(u => (u.branch || "") === b),
  })).filter(g => g.users.length > 0);

  const initials = (n) => n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2);
  const roleColor = (r) => r === "teacher" ? "#60a5fa" : r === "admin" ? "#f87171" : "#34d399";

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">💬 Messages</h2>
        <span className="badge badge-success">● {allUsers.filter(u => u.online).length} Online</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, height: "calc(100vh - 200px)", maxHeight: 680 }}>
        {/* Sidebar */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div style={{ padding: 14, borderBottom: "1px solid var(--border)" }}>
            <input
              placeholder="🔍 Search conversations..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 10, fontSize: "0.8rem" }}
            />
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {grouped.map(({ branch, users }) => (
              <div key={branch}>
                <p style={{ padding: "8px 16px 4px", fontSize: "0.65rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", background: "var(--bg2)", borderBottom: "1px solid var(--border)" }}>
                  {branch}
                </p>
                {users.map(u => {
                  const lastMsg = DEMO_MESSAGES[u.id]?.slice(-1)[0];
                  const isSelected = selectedUser.id === u.id;
                  return (
                    <div key={u.id}
                      onClick={() => setSelectedUser(u)}
                      style={{
                        display: "flex", gap: 12, padding: "12px 16px",
                        cursor: "pointer",
                        background: isSelected ? "var(--surface2)" : "transparent",
                        borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "var(--surface)"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                    >
                      <div style={{ position: "relative" }}>
                        <div style={{
                          width: 42, height: 42, borderRadius: 12,
                          background: u.hod ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, var(--primary), #8b5cf6)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.85rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}>{initials(u.name)}</div>
                        {u.online && (
                          <div style={{
                            position: "absolute", bottom: 2, right: 2,
                            width: 10, height: 10, borderRadius: "50%",
                            background: "#34d399", border: "2px solid var(--surface)",
                          }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{u.name}</p>
                          {u.hod && <span style={{ fontSize: "0.6rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "1px 5px", flexShrink: 0 }}>HOD</span>}
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "var(--text3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 2 }}>
                          {lastMsg ? (lastMsg.own ? "You: " : "") + lastMsg.text : "No messages yet"}
                        </p>
                        <span style={{ fontSize: "0.65rem", fontWeight: 600, color: roleColor(u.role) }}>{u.subject || u.role}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg2)" }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: selectedUser.hod ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "linear-gradient(135deg, var(--primary), #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: 700, color: "#fff",
              }}>{initials(selectedUser.name)}</div>
              {selectedUser.online && (
                <div style={{ position: "absolute", bottom: 2, right: 2, width: 10, height: 10, borderRadius: "50%", background: "#34d399", border: "2px solid var(--bg2)" }} />
              )}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{selectedUser.name}</p>
                {selectedUser.hod && <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: 6, padding: "2px 7px" }}>HOD · {selectedUser.branch}</span>}
              </div>
              <p style={{ fontSize: "0.72rem", color: selectedUser.online ? "#34d399" : "var(--text3)" }}>
                {selectedUser.online ? "● Online" : "● Offline"}
                {selectedUser.subject ? ` · ${selectedUser.subject}` : ""}
              </p>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              {selectedUser.phone && (
                <a
                  href={`https://wa.me/${selectedUser.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  title={`WhatsApp ${selectedUser.name}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "6px 12px", borderRadius: 10, textDecoration: "none",
                    background: "#25D366", color: "#fff",
                    fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L.057 23.882l6.186-1.443A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.006-1.371l-.36-.214-3.724.868.936-3.42-.235-.372A9.818 9.818 0 1112 21.818z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
              <div className="icon-btn" title="Video call">📹</div>
              <div className="icon-btn" title="Call">📞</div>
            </div>
          </div>

          {/* Messages */}
          <div className="chat-messages" style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.own ? "own" : "other"}`}
                style={{ display: "flex", gap: 10, flexDirection: msg.own ? "row-reverse" : "row", alignItems: "flex-end" }}>
                {!msg.own && (
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--surface3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--text2)", flexShrink: 0 }}>
                    {initials(selectedUser.name)}
                  </div>
                )}
                <div style={{ maxWidth: "70%" }}>
                  <div className={`message-bubble ${msg.own ? "own" : "other"}`}
                    style={{
                      padding: "10px 14px",
                      borderRadius: msg.own ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.own ? "linear-gradient(135deg, var(--primary), #8b5cf6)" : "var(--surface2)",
                      color: msg.own ? "#fff" : "var(--text2)",
                      fontSize: "0.875rem",
                      lineHeight: 1.5,
                      boxShadow: msg.own ? "0 4px 14px rgba(99,102,241,0.3)" : "none",
                    }}>
                    {msg.text}
                  </div>
                  <p style={{ fontSize: "0.65rem", color: "var(--text3)", marginTop: 4, textAlign: msg.own ? "right" : "left" }}>{msg.time}</p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {QUICK_REPLIES.map(r => (
              <button key={r} onClick={() => sendMessage(r)}
                style={{ padding: "4px 10px", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 999, fontSize: "0.72rem", color: "var(--text3)", cursor: "pointer", transition: "all 0.2s", fontFamily: "inherit" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.color = "var(--primary-light)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text3)"; }}>
                {r}
              </button>
            ))}
          </div>

          {/* Input */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "center" }}>
            <div className="icon-btn">📎</div>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
              placeholder={`Message ${selectedUser.name}...`}
              style={{ flex: 1, padding: "10px 14px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 12, fontSize: "0.875rem" }}
            />
            <button
              onClick={() => sendMessage(input)}
              className="btn btn-primary btn-sm"
              style={{ padding: "10px 16px" }}>
              Send ↑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
