import { useState, useEffect } from "react";

const DAYS  = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const SLOTS = ["8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"];

const DEFAULT_TT = {
  Monday:    ["Mathematics","Physics","—","Lunch","Computer Science","Data Structures","—","—","—","—"],
  Tuesday:   ["English","Chemistry","Mathematics","Lunch","Physics","—","Lab","Lab","—","—"],
  Wednesday: ["Data Structures","Computer Science","English","Lunch","Chemistry","Mathematics","—","—","—","—"],
  Thursday:  ["Physics","—","Data Structures","Lunch","English","Computer Science","—","—","—","—"],
  Friday:    ["Chemistry","Mathematics","Physics","Lunch","—","English","Seminar","—","—","—"],
  Saturday:  ["Lab","Lab","Lab","—","—","—","—","—","—","—"],
};

const SUBJECT_COLORS = {
  Mathematics:        { bg:"rgba(139,92,246,0.12)", color:"#a78bfa" },
  Physics:            { bg:"rgba(59,130,246,0.12)",  color:"#60a5fa" },
  Chemistry:          { bg:"rgba(245,158,11,0.12)",  color:"#fbbf24" },
  English:            { bg:"rgba(16,185,129,0.12)",  color:"#34d399" },
  "Computer Science": { bg:"rgba(239,68,68,0.12)",   color:"#f87171" },
  "Data Structures":  { bg:"rgba(236,72,153,0.12)",  color:"#f472b6" },
  Lab:                { bg:"rgba(13,148,136,0.12)",  color:"#2dd4bf" },
  Seminar:            { bg:"rgba(245,158,11,0.1)",   color:"#fbbf24" },
  Lunch:              { bg:"rgba(99,102,241,0.05)",  color:"var(--text3)" },
  "—":                { bg:"transparent",             color:"var(--text3)" },
};

const PALETTE = [
  "#a78bfa","#60a5fa","#34d399","#f87171","#fbbf24",
  "#f472b6","#2dd4bf","#fb923c","#818cf8","#4ade80",
];

const today = DAYS[new Date().getDay() - 1] || "Monday";
const STORAGE_KEY = "cgu_my_timetable";

const emptyTT = () => Object.fromEntries(DAYS.map(d => [d, Array(SLOTS.length).fill("")]));

function getColor(subject, customColors) {
  if (!subject || subject === "—" || subject === "") return SUBJECT_COLORS["—"];
  if (SUBJECT_COLORS[subject]) return SUBJECT_COLORS[subject];
  const c = customColors[subject] || PALETTE[Math.abs([...subject].reduce((a,b)=>a+b.charCodeAt(0),0)) % PALETTE.length];
  return { bg: c + "22", color: c };
}

// ── College Timetable (read-only) ─────────────────────────────────────────────
function CollegeTimetable() {
  const [activeDay, setActiveDay] = useState(today);
  const currentHour = new Date().getHours();
  const currentSlotIdx = SLOTS.findIndex(s => parseInt(s) === currentHour);

  return (
    <>
      <div className="tabs">
        {DAYS.map(d => (
          <button key={d} className={`tab ${activeDay === d ? "active" : ""}`} onClick={() => setActiveDay(d)}>
            {d.slice(0,3)}
            {d === today && <span style={{ marginLeft:4, width:6, height:6, background:"#34d399", borderRadius:"50%", display:"inline-block" }} />}
          </button>
        ))}
      </div>

      <div style={{ display:"grid", gap:8, marginBottom:24 }}>
        {SLOTS.map((slot, i) => {
          const subject = DEFAULT_TT[activeDay]?.[i] || "—";
          const isNow = activeDay === today && i === currentSlotIdx;
          const cfg = getColor(subject, {});
          return (
            <div key={slot} style={{
              display:"flex", alignItems:"center", gap:16,
              background: isNow ? "linear-gradient(90deg,var(--primary),#8b5cf6)" : cfg.bg || "var(--surface)",
              borderRadius:12, padding:"14px 20px",
              border: isNow ? "none" : `1px solid ${subject !== "—" ? cfg.color+"30" : "var(--border)"}`,
              boxShadow: isNow ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
              transition:"all 0.2s",
            }}>
              <div style={{ minWidth:52 }}>
                <p style={{ fontSize:"0.8rem", fontWeight:700, color: isNow ? "rgba(255,255,255,0.8)" : "var(--text3)", fontFamily:"JetBrains Mono,monospace" }}>{slot}</p>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:600, fontSize:"0.95rem", color: isNow ? "#fff" : subject === "—" ? "var(--text3)" : cfg.color }}>
                  {subject === "—" ? "Free Period" : subject}
                </p>
                {isNow && <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.7)", marginTop:2 }}>● Ongoing now</p>}
              </div>
              {subject !== "—" && subject !== "Lunch" && (
                <span style={{ fontSize:"0.7rem", padding:"3px 10px", borderRadius:999, background: isNow ? "rgba(255,255,255,0.2)" : cfg.color+"20", color: isNow ? "#fff" : cfg.color, fontWeight:600 }}>
                  {subject === "Lab" ? "Lab" : subject === "Seminar" ? "Seminar" : "Lecture"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly overview table */}
      <div className="card" style={{ overflowX:"auto" }}>
        <p style={{ fontWeight:700, marginBottom:14, fontSize:"0.9rem" }}>Weekly Overview</p>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.75rem" }}>
          <thead>
            <tr>
              <th style={{ padding:"8px 10px", textAlign:"left" }}>Time</th>
              {DAYS.map(d => (
                <th key={d} style={{ padding:"8px 10px", color: d===today ? "var(--primary-light)" : "var(--text3)", fontWeight: d===today ? 700 : 500 }}>
                  {d.slice(0,3)}{d===today && " •"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, i) => (
              <tr key={slot}>
                <td style={{ padding:"8px 10px", color:"var(--text3)", fontFamily:"JetBrains Mono,monospace", fontSize:"0.72rem" }}>{slot}</td>
                {DAYS.map(d => {
                  const sub = DEFAULT_TT[d]?.[i] || "—";
                  const cfg = getColor(sub, {});
                  return (
                    <td key={d} style={{ padding:"7px 10px", color: sub==="—" ? "var(--text3)" : cfg.color, fontWeight: sub!=="—" && sub!=="Lunch" ? 600 : 400, background: sub!=="—" && sub!=="Lunch" ? cfg.bg : "transparent" }}>
                      {sub==="—" ? "—" : sub.slice(0,9)}{sub.length>9?"…":""}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ── My Timetable (personal, editable) ────────────────────────────────────────
function MyTimetable() {
  const [tt, setTT]               = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || emptyTT(); }
    catch { return emptyTT(); }
  });
  const [customColors, setCustomColors] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY + "_colors")) || {}; }
    catch { return {}; }
  });
  const [activeDay, setActiveDay] = useState(today);
  const [modal, setModal]         = useState(null); // { day, slotIdx }
  const [form, setForm]           = useState({ subject:"", type:"Lecture", note:"", color:"" });
  const [saved, setSaved]         = useState(false);

  // persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tt));
    localStorage.setItem(STORAGE_KEY + "_colors", JSON.stringify(customColors));
  }, [tt, customColors]);

  const openModal = (day, slotIdx) => {
    const existing = tt[day]?.[slotIdx] || "";
    setForm({ subject: existing, type:"Lecture", note:"", color: customColors[existing] || "" });
    setModal({ day, slotIdx });
  };

  const saveSlot = () => {
    const { day, slotIdx } = modal;
    const subject = form.subject.trim();
    setTT(prev => {
      const updated = { ...prev, [day]: [...(prev[day] || Array(SLOTS.length).fill(""))] };
      updated[day][slotIdx] = subject;
      return updated;
    });
    if (subject && form.color) {
      setCustomColors(prev => ({ ...prev, [subject]: form.color }));
    }
    setModal(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearSlot = (day, slotIdx) => {
    setTT(prev => {
      const updated = { ...prev, [day]: [...(prev[day] || Array(SLOTS.length).fill(""))] };
      updated[day][slotIdx] = "";
      return updated;
    });
  };

  const clearDay = (day) => {
    if (!window.confirm(`Clear all slots for ${day}?`)) return;
    setTT(prev => ({ ...prev, [day]: Array(SLOTS.length).fill("") }));
  };

  const clearAll = () => {
    if (!window.confirm("Clear your entire personal timetable?")) return;
    setTT(emptyTT());
  };

  const filledCount = Object.values(tt).flat().filter(Boolean).length;
  const currentHour = new Date().getHours();
  const currentSlotIdx = SLOTS.findIndex(s => parseInt(s) === currentHour);

  return (
    <>
      {/* Top bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:"0.8rem", color:"var(--text3)" }}>{filledCount} slots filled</span>
          {saved && <span style={{ fontSize:"0.75rem", color:"#34d399", fontWeight:600 }}>✓ Saved</span>}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-outline btn-sm" onClick={() => clearDay(activeDay)}>🗑 Clear {activeDay.slice(0,3)}</button>
          <button className="btn btn-outline btn-sm" style={{ color:"#f87171", borderColor:"rgba(239,68,68,0.3)" }} onClick={clearAll}>✕ Clear All</button>
        </div>
      </div>

      {/* Day tabs */}
      <div className="tabs">
        {DAYS.map(d => {
          const filled = (tt[d] || []).filter(Boolean).length;
          return (
            <button key={d} className={`tab ${activeDay===d ? "active" : ""}`} onClick={() => setActiveDay(d)}>
              {d.slice(0,3)}
              {filled > 0 && <span style={{ marginLeft:4, fontSize:"0.6rem", background:"var(--primary)", color:"#fff", borderRadius:999, padding:"0 5px", fontWeight:700 }}>{filled}</span>}
              {d===today && <span style={{ marginLeft:3, width:5, height:5, background:"#34d399", borderRadius:"50%", display:"inline-block" }} />}
            </button>
          );
        })}
      </div>

      {/* Slots grid */}
      <div style={{ display:"grid", gap:8, marginBottom:24 }}>
        {SLOTS.map((slot, i) => {
          const subject = tt[activeDay]?.[i] || "";
          const isNow = activeDay===today && i===currentSlotIdx;
          const cfg = subject ? getColor(subject, customColors) : { bg:"var(--surface)", color:"var(--text3)" };
          return (
            <div key={slot} style={{
              display:"flex", alignItems:"center", gap:14,
              background: isNow && subject ? "linear-gradient(90deg,var(--primary),#8b5cf6)" : subject ? cfg.bg : "var(--surface)",
              borderRadius:12, padding:"12px 16px",
              border: isNow && subject ? "none" : subject ? `1px solid ${cfg.color}30` : "1px dashed var(--border)",
              boxShadow: isNow && subject ? "0 4px 20px rgba(99,102,241,0.25)" : "none",
              transition:"all 0.2s", cursor:"pointer",
              opacity: subject ? 1 : 0.6,
            }}
              onClick={() => openModal(activeDay, i)}
            >
              <p style={{ minWidth:52, fontSize:"0.8rem", fontWeight:700, color: isNow && subject ? "rgba(255,255,255,0.8)" : "var(--text3)", fontFamily:"JetBrains Mono,monospace" }}>{slot}</p>
              <div style={{ flex:1 }}>
                {subject
                  ? <p style={{ fontWeight:600, fontSize:"0.92rem", color: isNow ? "#fff" : cfg.color }}>{subject}</p>
                  : <p style={{ fontSize:"0.85rem", color:"var(--text3)" }}>+ Add subject</p>
                }
                {isNow && subject && <p style={{ fontSize:"0.7rem", color:"rgba(255,255,255,0.7)", marginTop:1 }}>● Ongoing now</p>}
              </div>
              {subject && (
                <button
                  onClick={e => { e.stopPropagation(); clearSlot(activeDay, i); }}
                  style={{ background:"none", border:"none", cursor:"pointer", color: isNow ? "rgba(255,255,255,0.6)" : "var(--text3)", fontSize:"0.85rem", padding:"2px 6px", borderRadius:6 }}
                  title="Remove"
                >✕</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Weekly overview */}
      <div className="card" style={{ overflowX:"auto" }}>
        <p style={{ fontWeight:700, marginBottom:14, fontSize:"0.9rem" }}>My Weekly Overview</p>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.75rem" }}>
          <thead>
            <tr>
              <th style={{ padding:"8px 10px", textAlign:"left" }}>Time</th>
              {DAYS.map(d => (
                <th key={d} style={{ padding:"8px 10px", color: d===today ? "var(--primary-light)" : "var(--text3)", fontWeight: d===today ? 700 : 500 }}>
                  {d.slice(0,3)}{d===today && " •"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, i) => (
              <tr key={slot}>
                <td style={{ padding:"7px 10px", color:"var(--text3)", fontFamily:"JetBrains Mono,monospace", fontSize:"0.72rem" }}>{slot}</td>
                {DAYS.map(d => {
                  const sub = tt[d]?.[i] || "";
                  const cfg = sub ? getColor(sub, customColors) : null;
                  return (
                    <td key={d} style={{ padding:"7px 10px", color: sub ? cfg.color : "var(--text3)", fontWeight: sub ? 600 : 400, background: sub ? cfg.bg : "transparent", cursor:"pointer" }}
                      onClick={() => { setActiveDay(d); openModal(d, i); }}
                      title={sub || "Add subject"}
                    >
                      {sub ? (sub.slice(0,9) + (sub.length>9?"…":"")) : "—"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth:420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✏️ {modal.day} · {SLOTS[modal.slotIdx]}</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="form-group">
                <label>Subject / Activity</label>
                <input
                  autoFocus
                  placeholder="e.g. Mathematics, Gym, Self Study..."
                  value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
                  onKeyDown={e => e.key === "Enter" && saveSlot()}
                />
              </div>

              {/* Quick subject chips */}
              <div>
                <p style={{ fontSize:"0.72rem", color:"var(--text3)", marginBottom:6, fontWeight:600 }}>Quick add</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {["Mathematics","Physics","Chemistry","English","Computer Science","Data Structures","Lab","Seminar","Lunch","Break","Self Study","Gym","Library"].map(s => (
                    <button key={s} onClick={() => setForm(p => ({ ...p, subject:s }))}
                      style={{ padding:"3px 10px", borderRadius:999, fontSize:"0.72rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                        background: form.subject===s ? "var(--primary)" : "var(--surface2)",
                        color: form.subject===s ? "#fff" : "var(--text3)",
                        border: `1px solid ${form.subject===s ? "var(--primary)" : "var(--border2)"}`,
                      }}>{s}</button>
                  ))}
                </div>
              </div>

              {/* Color picker */}
              {form.subject && !SUBJECT_COLORS[form.subject] && (
                <div className="form-group">
                  <label>Label Color</label>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {PALETTE.map(c => (
                      <button key={c} onClick={() => setForm(p => ({ ...p, color:c }))}
                        style={{ width:28, height:28, borderRadius:"50%", background:c, border: form.color===c ? "3px solid #fff" : "2px solid transparent", cursor:"pointer", outline: form.color===c ? `2px solid ${c}` : "none" }} />
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:8, marginTop:4 }}>
                <button className="btn btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={saveSlot}
                  disabled={!form.subject.trim()}>
                  Save
                </button>
                {tt[modal.day]?.[modal.slotIdx] && (
                  <button className="btn btn-outline" style={{ color:"#f87171", borderColor:"rgba(239,68,68,0.3)" }}
                    onClick={() => { clearSlot(modal.day, modal.slotIdx); setModal(null); }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function Timetable({ user }) {
  const [tab, setTab] = useState("college");

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🗓 Timetable</h2>
        <span className="badge badge-info">Semester {user?.semester || 5} · {user?.batch || "2022–26"}</span>
      </div>

      <div className="tabs">
        <button className={`tab ${tab==="college" ? "active" : ""}`} onClick={() => setTab("college")}>🏫 College Timetable</button>
        <button className={`tab ${tab==="my" ? "active" : ""}`} onClick={() => setTab("my")}>✏️ My Timetable</button>
      </div>

      {tab === "college" ? <CollegeTimetable /> : <MyTimetable />}
    </div>
  );
}
