import { useState } from "react";

export default function Calendar({ events = [], assignments = [] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const prevMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  
  const getEventsForDay = (day) => {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split('T')[0];
    return [
      ...events.filter(e => e.date?.startsWith(dateStr)),
      ...assignments.filter(a => a.dueDate?.startsWith(dateStr))
    ];
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>{monthNames[month]} {year}</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline btn-sm" onClick={prevMonth}>←</button>
          <button className="btn btn-outline btn-sm" onClick={nextMonth}>→</button>
        </div>
      </div>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} style={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 700, color: "var(--text3)", padding: "8px 0" }}>
            {d}
          </div>
        ))}
        
        {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} />)}
        
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const dayEvents = getEventsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
          
          return (
            <div key={day} style={{
              padding: 8,
              borderRadius: 8,
              background: isToday ? "rgba(99,102,241,0.15)" : "var(--bg2)",
              border: `1px solid ${isToday ? "var(--primary)" : "var(--border)"}`,
              minHeight: 60,
              position: "relative"
            }}>
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: isToday ? "var(--primary-light)" : "var(--text2)" }}>
                {day}
              </div>
              {dayEvents.length > 0 && (
                <div style={{ marginTop: 4 }}>
                  {dayEvents.slice(0, 2).map((e, idx) => (
                    <div key={idx} style={{
                      fontSize: "0.6rem",
                      padding: "2px 4px",
                      borderRadius: 4,
                      background: e.title ? "rgba(245,158,11,0.2)" : "rgba(99,102,241,0.2)",
                      color: e.title ? "#fbbf24" : "#818cf8",
                      marginBottom: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {e.title || e.name}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div style={{ fontSize: "0.55rem", color: "var(--text3)", marginTop: 2 }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
