import { useState } from "react";
import ErrorBoundary from "./ErrorBoundary";
import ThemeToggle from "../components/ThemeToggle";
import Home from "./Home";
import Assignments from "./Assignments";
import Fees from "./Fees";
import Hostel from "./Hostel";
import Food from "./Food";
import Dispensary from "./Dispensary";
import TechSupport from "./TechSupport";
import Faculty from "./Faculty";
import Notifications from "./Notifications";
import Attendance from "./Attendance";
import Timetable from "./Timetable";
import Library from "./Library";
import Results from "./Results";
import Events from "./Events";
import LostFound from "./LostFound";
import Chat from "./Chat";
import Users from "./Users";
import Leaves from "./Leaves";
import PremiumDashboard from "./PremiumDashboard";
import IDCard from "./IDCard";

const NAV_ALL = [
  { key: "home",          label: "Dashboard",       icon: "⬡",  section: "overview", roles: ["student","teacher","admin"] },
  { key: "notifications", label: "Announcements",   icon: "📢", section: "overview", roles: ["student","teacher","admin"], badge: true },
  { key: "chat",          label: "Messages",        icon: "💬", section: "overview", roles: ["student","teacher"] },
  { key: "users",         label: "User Management", icon: "👥", section: "admin",    roles: ["admin"] },
  { key: "analytics",     label: "Analytics",       icon: "📈", section: "admin",    roles: ["admin"] },
  { key: "timetable",     label: "Timetable",       icon: "🗓", section: "academic", roles: ["student","teacher"] },
  { key: "attendance",    label: "Attendance",      icon: "📊", section: "academic", roles: ["student","teacher","admin"] },
  { key: "assignments",   label: "Assignments",     icon: "📝", section: "academic", roles: ["student","teacher"] },
  { key: "results",       label: "Results & GPA",   icon: "🏅", section: "academic", roles: ["student","teacher","admin"] },
  { key: "leaves",        label: "Leave Requests",  icon: "📋", section: "academic", roles: ["student","teacher","admin"] },
  { key: "library",       label: "Library",         icon: "📚", section: "academic", roles: ["student","teacher","admin"] },
  { key: "faculty",       label: "Faculty",         icon: "👨🏫",section: "academic", roles: ["student","teacher","admin"] },
  { key: "fees",          label: "Fees & Finance",  icon: "💳", section: "finance",  roles: ["student","admin"] },
  { key: "idcard",        label: "My ID Card",      icon: "🪧", section: "finance",  roles: ["student"] },
  { key: "hostel",        label: "Hostel",          icon: "🏠", section: "campus",   roles: ["student","admin"] },
  { key: "food",          label: "Canteen",         icon: "🍱", section: "campus",   roles: ["student","admin"] },
  { key: "dispensary",    label: "Medical",         icon: "🏥", section: "campus",   roles: ["student","admin"] },
  { key: "events",        label: "Events",          icon: "🎉", section: "campus",   roles: ["student","teacher","admin"] },
  { key: "lostfound",     label: "Lost & Found",    icon: "🔍", section: "campus",   roles: ["student","teacher","admin"] },
  { key: "tech",          label: "Tech Support",    icon: "🔧", section: "support",  roles: ["student","teacher","admin"] },
];

const SECTIONS = [
  { key: "overview", label: "Overview" },
  { key: "admin",    label: "Administration" },
  { key: "academic", label: "Academic" },
  { key: "finance",  label: "Finance" },
  { key: "campus",   label: "Campus Life" },
  { key: "support",  label: "Support" },
];

const PAGE_TITLES = {
  home: "Dashboard", notifications: "Announcements", chat: "Messages",
  users: "User Management", analytics: "Analytics", leaves: "Leave Requests",
  idcard: "My ID Card",
  timetable: "Timetable", attendance: "Attendance", assignments: "Assignments",
  results: "Results & GPA", library: "Library", faculty: "Faculty Directory",
  fees: "Fees & Finance", hostel: "Hostel", food: "Canteen",
  dispensary: "Medical", events: "Events", lostfound: "Lost & Found", tech: "Tech Support",
};

const ROLE_COLORS = { admin: "#f87171", teacher: "#60a5fa", student: "#34d399" };
const ROLE_BADGES = { admin: "badge-danger", teacher: "badge-info", student: "badge-success" };

export default function Dashboard({ setPage }) {
  const [active, setActive]         = useState("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch]         = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const NAV = NAV_ALL.filter(n => n.roles.includes(user.role));
  const initials = name => name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setPage("login");
  };

  const navigate = key => { setActive(key); setSidebarOpen(false); setSearch(""); setSearchOpen(false); };

  // Search filter
  const searchResults = search.length > 1
    ? NAV.filter(n => n.label.toLowerCase().includes(search.toLowerCase()))
    : [];

  const renderPage = () => {
    const props = { user, setActive: navigate };
    const pages = {
      home: <Home {...props} />,
      assignments: <Assignments {...props} />,
      fees: <Fees {...props} />,
      hostel: <Hostel {...props} />,
      food: <Food {...props} />,
      dispensary: <Dispensary {...props} />,
      tech: <TechSupport {...props} />,
      faculty: <Faculty {...props} />,
      notifications: <Notifications {...props} />,
      attendance: <Attendance {...props} />,
      timetable: <Timetable {...props} />,
      library: <Library {...props} />,
      results: <Results {...props} />,
      events: <Events {...props} />,
      lostfound: <LostFound {...props} />,
      chat: <Chat {...props} />,
      users: <Users {...props} />,
      analytics: <PremiumDashboard {...props} />,
      idcard: <IDCard {...props} />,
      leaves: <Leaves {...props} />,
    };
    return pages[active] || <Home {...props} />;
  };

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          zIndex: 99, backdropFilter: "blur(2px)"
        }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo" onClick={() => navigate("home")} style={{ cursor: "pointer" }}>
          <div className="logo-mark">
            <div className="logo-icon">🎓</div>
            <div className="logo-text">
              <h2>CGUCampusOne</h2>
              <p>CGUCampusOne</p>
            </div>
          </div>
          {/* Role badge under logo */}
          <div style={{ marginTop: 10 }}>
            <span className={`badge ${ROLE_BADGES[user.role]}`} style={{ fontSize: "0.65rem" }}>
              {user.role === "admin" ? "⚙️ Administrator" : user.role === "teacher" ? "👨🏫 Faculty" : "🎓 Student"}
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {SECTIONS.map(section => {
            const items = NAV.filter(n => n.section === section.key);
            if (!items.length) return null;
            return (
              <div key={section.key}>
                <div className="nav-section">{section.label}</div>
                {items.map(item => (
                  <div key={item.key}
                    className={`nav-item ${active === item.key ? "active" : ""}`}
                    onClick={() => navigate(item.key)}>
                    <span className="nav-icon">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge && <span className="nav-badge">!</span>}
                  </div>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-card">
            <div className="avatar">{initials(user.name)}</div>
            <div className="user-card-text">
              <p>{user.name}</p>
              <span style={{ color: ROLE_COLORS[user.role] }}>{user.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={logout}>⬡ Sign Out</button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="main">
        <header className="topbar">
          <div className="topbar-left">
            <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="breadcrumb">
              <span className="breadcrumb-item" style={{ cursor: "pointer" }} onClick={() => navigate("home")}>CGUCampusOne</span>
              {active !== "home" && (
                <>
                  <span className="breadcrumb-sep">›</span>
                  <span className="breadcrumb-current">{PAGE_TITLES[active]}</span>
                </>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="topbar-search" style={{ position: "relative" }}>
            <span>🔍</span>
            <input
              placeholder="Search pages... (type to navigate)"
              value={search}
              onChange={e => { setSearch(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
            {searchOpen && searchResults.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: "var(--surface)", border: "1px solid var(--border2)",
                borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.4)", zIndex: 300, overflow: "hidden"
              }}>
                {searchResults.map(r => (
                  <div key={r.key} onMouseDown={() => navigate(r.key)} style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                    cursor: "pointer", transition: "background 0.15s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span>{r.icon}</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="topbar-right">
            <ThemeToggle />
            <div className="icon-btn" onClick={() => navigate("notifications")} title="Notifications">
              🔔
              <div className="notif-pip" />
            </div>
            {(user.role === "student" || user.role === "teacher") && (
              <div className="icon-btn" onClick={() => navigate("chat")} title="Messages">💬</div>
            )}
            <div className="avatar" onClick={() => navigate("home")} style={{ cursor: "pointer" }} title={user.name}>
              {initials(user.name)}
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto" }}>
          <ErrorBoundary key={active}>
            <div className="page-enter">
              {renderPage()}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
