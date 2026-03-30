import { useState, useEffect, useRef } from "react";
import API from "../api";

// branch: CS, ECE, ME, CE, EE  |  hod: true marks the HOD of that branch
const DEMO_USERS = [
  // ── Computer Science ──
  { id: "cs1", name: "Dr. Anita Singh",      role: "teacher", branch: "Computer Science", subject: "Data Structures",        hod: true,  online: true,  phone: "919876543201" },
  { id: "cs2", name: "Prof. Rahul Verma",    role: "teacher", branch: "Computer Science", subject: "Operating Systems",       hod: false, online: true,  phone: "919876543202" },
  { id: "cs3", name: "Ms. Pooja Iyer",       role: "teacher", branch: "Computer Science", subject: "Web Technologies",        hod: false, online: false, phone: "919876543203" },
  { id: "cs4", name: "Mr. Karan Mehta",      role: "teacher", branch: "Computer Science", subject: "Machine Learning",        hod: false, online: true,  phone: "919876543204" },
  // ── Electronics & Communication ──
  { id: "ec1", name: "Dr. Suresh Nair",      role: "teacher", branch: "Electronics",      subject: "VLSI Design",             hod: true,  online: true,  phone: "919876543205" },
  { id: "ec2", name: "Prof. Meena Pillai",   role: "teacher", branch: "Electronics",      subject: "Signal Processing",       hod: false, online: false, phone: "919876543206" },
  { id: "ec3", name: "Mr. Arun Krishnan",    role: "teacher", branch: "Electronics",      subject: "Embedded Systems",        hod: false, online: true,  phone: "919876543207" },
  { id: "ec4", name: "Ms. Divya Menon",      role: "teacher", branch: "Electronics",      subject: "Communication Systems",   hod: false, online: false, phone: "919876543208" },
  // ── Mechanical Engineering ──
  { id: "me1", name: "Dr. Vikram Joshi",     role: "teacher", branch: "Mechanical",       subject: "Thermodynamics",          hod: true,  online: false, phone: "919876543209" },
  { id: "me2", name: "Prof. Sunita Rao",     role: "teacher", branch: "Mechanical",       subject: "Fluid Mechanics",         hod: false, online: true,  phone: "919876543210" },
  { id: "me3", name: "Mr. Deepak Tiwari",    role: "teacher", branch: "Mechanical",       subject: "Manufacturing Processes", hod: false, online: false, phone: "919876543211" },
  { id: "me4", name: "Ms. Kavita Desai",     role: "teacher", branch: "Mechanical",       subject: "CAD/CAM",                 hod: false, online: true,  phone: "919876543212" },
  // ── Civil Engineering ──
  { id: "ce1", name: "Dr. Priya Sharma",     role: "teacher", branch: "Civil",            subject: "Structural Analysis",     hod: true,  online: true,  phone: "919876543213" },
  { id: "ce2", name: "Prof. Amit Gupta",     role: "teacher", branch: "Civil",            subject: "Geotechnical Engg.",      hod: false, online: true,  phone: "919876543214" },
  { id: "ce3", name: "Mr. Rohit Pandey",     role: "teacher", branch: "Civil",            subject: "Environmental Engg.",     hod: false, online: false, phone: "919876543215" },
  { id: "ce4", name: "Ms. Neha Kulkarni",    role: "teacher", branch: "Civil",            subject: "Transportation Engg.",    hod: false, online: true,  phone: "919876543216" },
  // ── Electrical Engineering ──
  { id: "ee1", name: "Dr. Rajesh Patil",     role: "teacher", branch: "Electrical",       subject: "Power Systems",           hod: true,  online: false, phone: "919876543217" },
  { id: "ee2", name: "Prof. Shalini Dubey",  role: "teacher", branch: "Electrical",       subject: "Control Systems",         hod: false, online: true,  phone: "919876543218" },
  { id: "ee3", name: "Mr. Nitin Bhatt",      role: "teacher", branch: "Electrical",       subject: "Electric Machines",       hod: false, online: false, phone: "919876543219" },
  { id: "ee4", name: "Ms. Ritu Agarwal",     role: "teacher", branch: "Electrical",       subject: "Power Electronics",       hod: false, online: true,  phone: "919876543220" },
  // ── Others ──
  { id: "adm", name: "Admin Office",         role: "admin",   branch: "",                subject: "",                        hod: false, online: true,  phone: "919876543200" },
];

const DEMO_MESSAGES = {
  cs1: [
    { id: 1, from: "cs1", text: "Welcome! I'm Dr. Anita Singh, HOD of Computer Science. Feel free to reach out for academic guidance.", time: "9:00 AM", own: false },
    { id: 2, from: "me",  text: "Thank you ma'am. I wanted to ask about the upcoming project submission.", time: "9:02 AM", own: true },
    { id: 3, from: "cs1", text: "The deadline is next Friday. Make sure your GitHub repo link is included in the report.", time: "9:03 AM", own: false },
  ],
  cs2: [
    { id: 1, from: "cs2", text: "OS assignment 3 has been uploaded. Please go through the scheduling algorithms section.", time: "10:00 AM", own: false },
    { id: 2, from: "me",  text: "Noted sir, will check it today.", time: "10:05 AM", own: true },
  ],
  cs3: [
    { id: 1, from: "cs3", text: "Lab tomorrow: bring your React project files. We'll do a live code review.", time: "Yesterday", own: false },
    { id: 2, from: "me",  text: "Sure ma'am, I'll have it ready.", time: "Yesterday", own: true },
  ],
  cs4: [
    { id: 1, from: "cs4", text: "ML quiz on Friday covers regression and classification. Revise sklearn basics.", time: "11:00 AM", own: false },
    { id: 2, from: "me",  text: "Thank you for the heads up!", time: "11:10 AM", own: true },
  ],
  ec1: [
    { id: 1, from: "ec1", text: "Hello, I'm Dr. Suresh Nair, HOD of Electronics. My door is open for any branch-related concerns.", time: "8:30 AM", own: false },
    { id: 2, from: "me",  text: "Good morning sir. I had a query about the VLSI lab schedule.", time: "8:35 AM", own: true },
    { id: 3, from: "ec1", text: "Lab slots are posted on the notice board. Check Tuesday 2–4 PM slot for your batch.", time: "8:36 AM", own: false },
  ],
  ec2: [
    { id: 1, from: "ec2", text: "DSP assignment submission extended to Monday. Upload on the portal.", time: "3:00 PM", own: false },
    { id: 2, from: "me",  text: "Thank you ma'am!", time: "3:05 PM", own: true },
  ],
  ec3: [
    { id: 1, from: "ec3", text: "Embedded systems project demo is on 20th. Prepare your circuit diagrams.", time: "Yesterday", own: false },
    { id: 2, from: "me",  text: "Understood sir, we'll be ready.", time: "Yesterday", own: true },
  ],
  ec4: [
    { id: 1, from: "ec4", text: "Reminder: Communication Systems mid-term is next week. Focus on modulation techniques.", time: "2:00 PM", own: false },
    { id: 2, from: "me",  text: "Got it ma'am, will revise.", time: "2:10 PM", own: true },
  ],
  me1: [
    { id: 1, from: "me1", text: "I'm Dr. Vikram Joshi, HOD of Mechanical Engineering. Reach out for any academic or placement queries.", time: "9:15 AM", own: false },
    { id: 2, from: "me",  text: "Sir, I wanted to discuss my internship options.", time: "9:20 AM", own: true },
    { id: 3, from: "me1", text: "Come to my office Thursday after 3 PM. I'll guide you through the core companies visiting this semester.", time: "9:21 AM", own: false },
  ],
  me2: [
    { id: 1, from: "me2", text: "Fluid Mechanics tutorial sheet 4 is uploaded. Solve problems 1–8 before next class.", time: "10:30 AM", own: false },
    { id: 2, from: "me",  text: "Thank you ma'am.", time: "10:35 AM", own: true },
  ],
  me3: [
    { id: 1, from: "me3", text: "Workshop visit is scheduled for Thursday. Attendance is mandatory.", time: "Yesterday", own: false },
    { id: 2, from: "me",  text: "Noted sir, will be there.", time: "Yesterday", own: true },
  ],
  me4: [
    { id: 1, from: "me4", text: "CAD model submission deadline is this Sunday midnight. Use SolidWorks format.", time: "1:00 PM", own: false },
    { id: 2, from: "me",  text: "Understood ma'am, will submit on time.", time: "1:15 PM", own: true },
  ],
  ce1: [
    { id: 1, from: "ce1", text: "Hi, I'm Dr. Priya Sharma, HOD of Civil Engineering. Feel free to connect for any academic support.", time: "8:45 AM", own: false },
    { id: 2, from: "me",  text: "Good morning ma'am. I wanted to ask about the structural analysis project.", time: "8:50 AM", own: true },
    { id: 3, from: "ce1", text: "Submit your load analysis report by Wednesday. Use IS code references wherever applicable.", time: "8:52 AM", own: false },
  ],
  ce2: [
    { id: 1, from: "ce2", text: "Soil testing lab report is due next Monday. Follow the format shared in class.", time: "11:00 AM", own: false },
    { id: 2, from: "me",  text: "Sure sir, will submit on time.", time: "11:10 AM", own: true },
  ],
  ce3: [
    { id: 1, from: "ce3", text: "Field visit to the water treatment plant is on Friday. Bring your observation notebooks.", time: "Yesterday", own: false },
    { id: 2, from: "me",  text: "Thank you sir for the reminder.", time: "Yesterday", own: true },
  ],
  ce4: [
    { id: 1, from: "ce4", text: "Transportation quiz postponed to next Tuesday. Extra class on Saturday at 10 AM.", time: "4:00 PM", own: false },
    { id: 2, from: "me",  text: "Noted ma'am, thank you!", time: "4:05 PM", own: true },
  ],
  ee1: [
    { id: 1, from: "ee1", text: "I'm Dr. Rajesh Patil, HOD of Electrical Engineering. Contact me for branch-level academic matters.", time: "9:30 AM", own: false },
    { id: 2, from: "me",  text: "Sir, I had a question about the power systems elective.", time: "9:35 AM", own: true },
    { id: 3, from: "ee1", text: "The elective registration closes Friday. Fill the form on the portal and email me your preference.", time: "9:36 AM", own: false },
  ],
  ee2: [
    { id: 1, from: "ee2", text: "Control Systems assignment 2 is live. Bode plot questions are included — use MATLAB.", time: "10:00 AM", own: false },
    { id: 2, from: "me",  text: "Thank you ma'am, will start today.", time: "10:10 AM", own: true },
  ],
  ee3: [
    { id: 1, from: "ee3", text: "Electric Machines lab on Wednesday is shifted to Lab 4. Bring your observation book.", time: "Yesterday", own: false },
    { id: 2, from: "me",  text: "Got it sir, thank you.", time: "Yesterday", own: true },
  ],
  ee4: [
    { id: 1, from: "ee4", text: "Power Electronics viva is on 22nd. Revise converter topologies and switching waveforms.", time: "3:30 PM", own: false },
    { id: 2, from: "me",  text: "Understood ma'am, will prepare.", time: "3:40 PM", own: true },
  ],
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

export default function Chat({ user }) {
  const [selectedUser, setSelectedUser] = useState(DEMO_USERS[0]);
  const [messages, setMessages] = useState(DEMO_MESSAGES[DEMO_USERS[0].id] || []);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [allUsers, setAllUsers] = useState(DEMO_USERS);
  const bottomRef = useRef(null);

  useEffect(() => {
    // Fetch real faculty from DB and merge with demo users
    API.get("/users/faculty").then(r => {
      const demoIds = new Set(DEMO_USERS.map(u => u.name.toLowerCase()));
      const newFaculty = r.data
        .filter(f => !demoIds.has(f.name.toLowerCase()))
        .map(f => ({
          id: f._id,
          name: f.name,
          role: "teacher",
          branch: f.department || "Other",
          subject: f.subject || "",
          hod: f.isHOD || false,
          online: false,
          phone: f.phone ? f.phone.replace(/\D/g, "") : null,
          isReal: true,
        }));
      setAllUsers([...DEMO_USERS, ...newFaculty]);
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

  // group by branch for sidebar
  const branches = ["Computer Science", "Electronics", "Mechanical", "Civil", "Electrical",
    ...new Set(allUsers.filter(u => u.isReal).map(u => u.branch)),
    ""
  ];
  const grouped = [...new Set(branches)].map(b => ({
    branch: b || "Admin",
    users: filtered.filter(u => u.branch === b),
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
