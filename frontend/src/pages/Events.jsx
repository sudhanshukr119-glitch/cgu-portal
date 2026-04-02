import { useEffect, useState } from "react";
import API from "../api";

const CATEGORY_COLORS = {
  fest:     { bg: "#fce7f3", color: "#be185d", icon: "🎉" },
  workshop: { bg: "#dbeafe", color: "#1d4ed8", icon: "🛠️" },
  seminar:  { bg: "#d1fae5", color: "#065f46", icon: "🎤" },
  sports:   { bg: "#ffedd5", color: "#c2410c", icon: "⚽" },
  cultural: { bg: "#ede9fe", color: "#6d28d9", icon: "🎭" },
  exam:     { bg: "#fef3c7", color: "#b45309", icon: "📝" },
  other:    { bg: "#f3f4f6", color: "var(--text2)", icon: "📌" },
};

export default function Events({ user }) {
  const [events, setEvents] = useState([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ category: "workshop" });
  const [filter, setFilter] = useState("all");

  useEffect(() => { API.get("/events").then(r => setEvents(r.data)).catch(() => {}); }, []);

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/events", form);
      setEvents([...events, res.data]);
      setModal(false); setForm({ category: "workshop" });
    } catch (err) { alert(err?.response?.data?.message || "Failed to create event"); }
  };

  const toggleRSVP = async (id) => {
    try {
      const res = await API.post(`/events/${id}/rsvp`, { name: user.name });
      setEvents(events.map(e => e._id === id ? res.data : e));
    } catch (err) { alert(err?.response?.data?.message || "Failed to RSVP"); }
  };

  const isRSVPd = (event) => event.rsvps?.some(r => r.userId === user._id || r.userId === user.id);

  const filtered = filter === "all" ? events : events.filter(e => e.category === filter);
  const upcoming = filtered.filter(e => new Date(e.date) >= new Date());
  const past = filtered.filter(e => new Date(e.date) < new Date());

  const EventCard = ({ event }) => {
    const cat = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.other;
    const isPast = new Date(event.date) < new Date();
    const rsvpd = isRSVPd(event);
    const full = event.maxSeats && event.rsvps?.length >= event.maxSeats;

    return (
      <div className="card" style={{ borderTop: `3px solid ${cat.color}`, opacity: isPast ? 0.7 : 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: "1.5rem" }}>{cat.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>{event.title}</p>
              <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 999, background: cat.bg, color: cat.color, fontWeight: 600, textTransform: "capitalize" }}>
                {event.category}
              </span>
            </div>
          </div>
          {!isPast && (
            <button
              className={`btn btn-sm ${rsvpd ? "btn-outline" : "btn-primary"}`}
              onClick={() => toggleRSVP(event._id)}
              disabled={!rsvpd && full}
            >
              {rsvpd ? "✓ Going" : full ? "Full" : "RSVP"}
            </button>
          )}
        </div>

        <p style={{ fontSize: "0.875rem", color: "var(--text2)", marginBottom: 10 }}>{event.description}</p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.78rem", color: "var(--text3)" }}>
          <span>📅 {new Date(event.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
          {event.time && <span>🕐 {event.time}</span>}
          {event.venue && <span>📍 {event.venue}</span>}
          {event.organizer && <span>👤 {event.organizer}</span>}
        </div>

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
            {event.rsvps?.length || 0}{event.maxSeats ? `/${event.maxSeats}` : ""} registered
          </span>
          {isPast && <span className="badge badge-gray">Past Event</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🎉 Events & Activities</h2>
        {(user.role === "admin" || user.role === "teacher") && (
          <button className="btn btn-primary btn-sm" onClick={() => setModal(true)}>+ Create Event</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "fest", "workshop", "seminar", "sports", "cultural", "exam", "other"].map(c => (
          <button key={c} className={`tab ${filter === c ? "active" : ""}`}
            style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid var(--border)", background: filter === c ? "#4f46e5" : "#fff", color: filter === c ? "#fff" : "#374151", cursor: "pointer", fontSize: "0.8rem", textTransform: "capitalize" }}
            onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {upcoming.length > 0 && (
        <>
          <p style={{ fontWeight: 600, marginBottom: 12, color: "var(--text2)" }}>Upcoming Events ({upcoming.length})</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14, marginBottom: 24 }}>
            {upcoming.map(e => <EventCard key={e._id} event={e} />)}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <p style={{ fontWeight: 600, marginBottom: 12, color: "var(--text3)" }}>Past Events</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
            {past.map(e => <EventCard key={e._id} event={e} />)}
          </div>
        </>
      )}

      {events.length === 0 && <div className="card empty"><p>No events yet</p></div>}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Event</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={createEvent}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Title</label>
                  <input required placeholder="Event title" onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {Object.keys(CATEGORY_COLORS).map(c => <option key={c} value={c} style={{ textTransform: "capitalize" }}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" required onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" onChange={e => setForm({ ...form, time: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Venue</label>
                  <input placeholder="e.g. Auditorium" onChange={e => setForm({ ...form, venue: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Max Seats</label>
                  <input type="number" placeholder="Leave blank for unlimited" onChange={e => setForm({ ...form, maxSeats: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Organizer</label>
                  <input placeholder="Club / Department" onChange={e => setForm({ ...form, organizer: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Description</label>
                <textarea required rows={3} placeholder="Event details..." onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 14, width: "100%", justifyContent: "center" }} type="submit">
                Create Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
