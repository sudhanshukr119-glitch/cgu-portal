import { useState } from "react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const SLOTS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const DEFAULT_TT = {
  Monday:    ["Mathematics", "Physics", "—", "Lunch", "Computer Science", "Data Structures", "—", "—"],
  Tuesday:   ["English", "Chemistry", "Mathematics", "Lunch", "Physics", "—", "Lab", "Lab"],
  Wednesday: ["Data Structures", "Computer Science", "English", "Lunch", "Chemistry", "Mathematics", "—", "—"],
  Thursday:  ["Physics", "—", "Data Structures", "Lunch", "English", "Computer Science", "—", "—"],
  Friday:    ["Chemistry", "Mathematics", "Physics", "Lunch", "—", "English", "Seminar", "—"],
  Saturday:  ["Lab", "Lab", "Lab", "—", "—", "—", "—", "—"],
};

const COLORS = {
  Mathematics:        { bg: "rgba(139,92,246,0.12)", color: "#a78bfa" },
  Physics:            { bg: "rgba(59,130,246,0.12)",  color: "#60a5fa" },
  Chemistry:          { bg: "rgba(245,158,11,0.12)", color: "#fbbf24" },
  English:            { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  "Computer Science": { bg: "rgba(239,68,68,0.12)",  color: "#f87171" },
  "Data Structures":  { bg: "rgba(236,72,153,0.12)", color: "#f472b6" },
  Lab:                { bg: "rgba(13,148,136,0.12)", color: "#2dd4bf" },
  Seminar:            { bg: "rgba(245,158,11,0.1)",  color: "#fbbf24" },
  Lunch:              { bg: "rgba(99,102,241,0.05)", color: "var(--text3)" },
  "—":                { bg: "transparent",            color: "var(--text3)" },
};

const today = DAYS[new Date().getDay() - 1] || "Monday";

export default function Timetable() {
  const [tt] = useState(DEFAULT_TT);
  const [activeDay, setActiveDay] = useState(today);
  const currentHour = new Date().getHours();
  const currentSlotIdx = SLOTS.findIndex(s => parseInt(s) === currentHour);

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🗓 Class Timetable</h2>
        <span className="badge badge-info">Semester 5 · Batch 2022–26</span>
      </div>

      <div className="tabs">
        {DAYS.map(d => (
          <button key={d} className={`tab ${activeDay === d ? "active" : ""}`} onClick={() => setActiveDay(d)}>
            {d.slice(0, 3)}
            {d === today && <span style={{ marginLeft: 4, width: 6, height: 6, background: "#34d399", borderRadius: "50%", display: "inline-block" }} />}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8, marginBottom: 24 }}>
        {SLOTS.map((slot, i) => {
          const subject = tt[activeDay]?.[i] || "—";
          const isNow = activeDay === today && i === currentSlotIdx;
          const cfg = COLORS[subject] || COLORS["—"];
          return (
            <div key={slot} style={{
              display: "flex", alignItems: "center", gap: 16,
              background: isNow ? "linear-gradient(90deg, var(--primary) 0%, #8b5cf6 100%)" : cfg.bg || "var(--surface)",
              borderRadius: 12,
              padding: "14px 20px",
              border: isNow ? "none" : `1px solid ${subject !== "—" ? cfg.color + "30" : "var(--border)"}`,
              boxShadow: isNow ? "0 4px 20px rgba(99,102,241,0.3)" : "none",
              transition: "all 0.2s",
            }}>
              <div style={{ minWidth: 56, textAlign: "center" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 700, color: isNow ? "rgba(255,255,255,0.8)" : "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>{slot}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: "0.95rem", color: isNow ? "#fff" : subject === "—" ? "var(--text3)" : cfg.color }}>
                  {subject === "—" ? "Free Period" : subject}
                </p>
                {isNow && <p style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>● Ongoing now</p>}
              </div>
              {subject !== "—" && subject !== "Lunch" && (
                <span style={{ fontSize: "0.7rem", padding: "3px 10px", borderRadius: 999, background: isNow ? "rgba(255,255,255,0.2)" : cfg.color + "20", color: isNow ? "#fff" : cfg.color, fontWeight: 600 }}>
                  {subject === "Lab" ? "Lab Session" : subject === "Seminar" ? "Seminar" : "Lecture"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ overflowX: "auto" }}>
        <p style={{ fontWeight: 700, marginBottom: 14, fontSize: "0.9rem", color: "var(--text)" }}>Weekly Overview</p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem" }}>
          <thead>
            <tr>
              <th style={{ padding: "8px 10px", textAlign: "left" }}>Time</th>
              {DAYS.map(d => (
                <th key={d} style={{ padding: "8px 10px", color: d === today ? "var(--primary-light)" : "var(--text3)", fontWeight: d === today ? 700 : 500 }}>
                  {d.slice(0, 3)}{d === today && " •"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOTS.map((slot, i) => (
              <tr key={slot}>
                <td style={{ padding: "8px 10px", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace", fontSize: "0.72rem" }}>{slot}</td>
                {DAYS.map(d => {
                  const sub = tt[d]?.[i] || "—";
                  const cfg = COLORS[sub] || COLORS["—"];
                  return (
                    <td key={d} style={{
                      padding: "7px 10px",
                      color: sub === "—" ? "var(--text3)" : cfg.color,
                      fontWeight: sub !== "—" && sub !== "Lunch" ? 600 : 400,
                      background: sub !== "—" && sub !== "Lunch" ? cfg.bg : "transparent",
                    }}>{sub === "—" ? "—" : sub.slice(0, 8)}{sub.length > 8 ? "…" : ""}</td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
