import { useState, useRef, useEffect, useCallback } from "react";
import API from "../api";
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", { autoConnect: true });

const CATEGORIES = ["All", "Books", "Electronics", "Stationery", "Clothing", "Furniture", "Other"];

const CAT_COLORS = {
  Books: "#6366f1", Electronics: "#0891b2", Stationery: "#059669",
  Clothing: "#d97706", Furniture: "#7c3aed", Other: "#64748b",
};

const CAT_ICON = { Books: "📚", Electronics: "💻", Stationery: "✏️", Clothing: "👕", Furniture: "🪑", Other: "📦" };

export default function Marketplace({ user }) {
  const [tab, setTab]                   = useState("browse");
  const [category, setCategory]         = useState("All");
  const [search, setSearch]             = useState("");
  const [listings, setListings]         = useState([]);
  const [loading, setLoading]           = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [chatFromTab, setChatFromTab]   = useState("browse"); // track which tab opened chat
  const [messages, setMessages]         = useState([]);
  const [chatInput, setChatInput]       = useState("");
  const [chatLoading, setChatLoading]   = useState(false);
  const [form, setForm]                 = useState({ title: "", price: "", category: "Books", desc: "", image: null });
  const [posting, setPosting]           = useState(false);
  const [imgError, setImgError]         = useState("");
  const fileInputRef = useRef(null);
  const bottomRef    = useRef(null);

  const compressImage = (file) => new Promise((resolve, reject) => {
    if (!file.type.match(/image\/(jpeg|jpg)/i))
      return reject(new Error("Only JPG/JPEG images are allowed."));
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 800;
      let { width, height } = img;
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
        else { width = Math.round(width * MAX / height); height = MAX; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.75));
    };
    img.onerror = () => reject(new Error("Failed to load image."));
    img.src = url;
  });

  const handleImageFile = async (file) => {
    setImgError("");
    try {
      const compressed = await compressImage(file);
      setForm(p => ({ ...p, image: compressed }));
    } catch (e) {
      setImgError(e.message);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get("/marketplace");
      setListings(res.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchListings();
    const interval = setInterval(fetchListings, 30000);
    return () => clearInterval(interval);
  }, [fetchListings]);

  useEffect(() => {
    if (!selectedListing) return;
    setMessages([]);
    setChatLoading(true);
    API.get(`/marketplace/${selectedListing._id}/messages`)
      .then(r => setMessages(r.data))
      .catch(() => {})
      .finally(() => setChatLoading(false));
    socket.emit("join_mp", selectedListing._id);
    const handler = (msg) => {
      if (msg.listingId === selectedListing._id)
        setMessages(prev => [...prev, msg]);
    };
    socket.on("mp_message", handler);
    return () => socket.off("mp_message", handler);
  }, [selectedListing]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = listings.filter(l =>
    (category === "All" || l.category === category) &&
    (l.title.toLowerCase().includes(search.toLowerCase()) ||
     l.seller.toLowerCase().includes(search.toLowerCase()) ||
     l.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const myListings = listings.filter(l => l.sellerId === (user?._id || user?.id));

  const sendChat = async () => {
    if (!chatInput.trim() || !selectedListing) return;
    const text = chatInput.trim();
    setChatInput("");
    try {
      await API.post(`/marketplace/${selectedListing._id}/messages`, { text });
    } catch { /* silent */ }
  };

  const postListing = async () => {
    if (!form.title.trim() || !form.price || !form.desc.trim()) return;
    setPosting(true);
    try {
      await API.post("/marketplace", {
        title: form.title, price: form.price,
        category: form.category, desc: form.desc, image: form.image,
      });
      await fetchListings();
      setForm({ title: "", price: "", category: "Books", desc: "", image: null });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTab("mylistings");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to post listing.");
    } finally { setPosting(false); }
  };

  const markSold = async (id) => {
    try {
      await API.put(`/marketplace/${id}`, { sold: true });
      await fetchListings();
    } catch { alert("Failed to update listing."); }
  };

  const deleteListing = async (id) => {
    try {
      await API.delete(`/marketplace/${id}`);
      await fetchListings();
    } catch { alert("Failed to delete listing."); }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return "Just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const initials = (n = "") => n.split(" ").map(x => x[0]).join("").toUpperCase().slice(0, 2);

  const userId = user?._id || user?.id;
  const isOwner = (l) => l.sellerId === userId || l.sellerId?._id === userId;

  const openChat = (listing, fromTab) => {
    setChatFromTab(fromTab);
    setSelectedListing(listing);
    setChatInput("");
  };

  const closeChat = () => {
    setSelectedListing(null);
    setMessages([]);
    setTab(chatFromTab);
  };

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🛒 Student Marketplace <span>{listings.filter(l => !l.sold).length} active listings</span></h2>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 20 }}>
        {[["browse", "🔍 Browse"], ["sell", "➕ Sell Item"], ["mylistings", "📦 My Listings"]].map(([k, l]) => (
          <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => { setTab(k); setSelectedListing(null); setMessages([]); }}>{l}</button>
        ))}
      </div>

      {/* ── BROWSE TAB ── */}
      {tab === "browse" && !selectedListing && (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border2)", borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 200 }}>
              <span style={{ color: "var(--text3)" }}>🔍</span>
              <input placeholder="Search listings..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ border: "none", background: "transparent", outline: "none", fontSize: "0.875rem", flex: 1 }} />
            </div>
            <div className="tabs" style={{ marginBottom: 0 }}>
              {CATEGORIES.map(c => (
                <button key={c} className={`tab ${category === c ? "active" : ""}`} onClick={() => setCategory(c)}>{c}</button>
              ))}
            </div>
          </div>

          {loading && <p style={{ color: "var(--text3)", textAlign: "center", padding: 32 }}>Loading listings...</p>}

          {!loading && filtered.length === 0 && (
            <div className="card empty"><div className="empty-icon">🛒</div><p>No listings found</p></div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map(l => (
              <div key={l._id} className="card" style={{ position: "relative", opacity: l.sold ? 0.6 : 1 }}>
                {l.sold && (
                  <div style={{ position: "absolute", top: 12, right: 12, background: "#ef4444", color: "#fff", fontSize: "0.65rem", fontWeight: 700, borderRadius: 6, padding: "2px 8px" }}>SOLD</div>
                )}
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 12, flexShrink: 0, overflow: "hidden",
                    background: `${CAT_COLORS[l.category]}22`, border: `1.5px solid ${CAT_COLORS[l.category]}44`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem",
                  }}>
                    {l.image
                      ? <img src={l.image} alt="item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : CAT_ICON[l.category] || "📦"}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{l.title}</p>
                    <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginTop: 3 }}>{l.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: "1rem", color: "#34d399" }}>₹{l.price}</span>
                      <span style={{ fontSize: "0.65rem", fontWeight: 700, background: `${CAT_COLORS[l.category]}22`, color: CAT_COLORS[l.category], borderRadius: 6, padding: "2px 7px" }}>{l.category}</span>
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 700, color: "#fff" }}>
                      {initials(l.seller)}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text2)" }}>{l.seller}</p>
                      <p style={{ fontSize: "0.65rem", color: "var(--text3)" }}>{l.dept} · {timeAgo(l.createdAt)}</p>
                    </div>
                  </div>
                  {!l.sold && (
                    <button className="btn btn-primary btn-xs" onClick={() => openChat(l, "browse")}>💬 Chat</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CHAT VIEW ── */}
      {selectedListing && (
        <div>
          <button className="btn btn-outline btn-sm" style={{ marginBottom: 16 }} onClick={closeChat}>← Back</button>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", background: `${CAT_COLORS[selectedListing.category]}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  {selectedListing.image
                    ? <img src={selectedListing.image} alt="item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : CAT_ICON[selectedListing.category] || "📦"}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>{selectedListing.title}</p>
                  <span style={{ fontWeight: 800, fontSize: "1.1rem", color: "#34d399" }}>₹{selectedListing.price}</span>
                </div>
              </div>
              <p style={{ color: "var(--text3)", fontSize: "0.82rem", marginBottom: 12 }}>{selectedListing.desc}</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.7rem", fontWeight: 700, background: `${CAT_COLORS[selectedListing.category]}22`, color: CAT_COLORS[selectedListing.category], borderRadius: 6, padding: "2px 8px" }}>{selectedListing.category}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>🎓 {selectedListing.dept}</span>
                <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>🕐 {timeAgo(selectedListing.createdAt)}</span>
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>
                  {initials(selectedListing.seller)}
                </div>
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text)" }}>{selectedListing.seller}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>Seller · {selectedListing.dept}</p>
                </div>
              </div>
            </div>

            <div className="card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", minHeight: 360 }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", background: "var(--bg2)", fontWeight: 700, fontSize: "0.85rem", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>💬 {isOwner(selectedListing) ? `Chat about: ${selectedListing.title}` : `Chat with ${selectedListing.seller}`}</span>
                <span style={{ fontSize: "0.7rem", fontWeight: 500, color: isOwner(selectedListing) ? "#34d399" : "var(--primary-light)" }}>
                  {isOwner(selectedListing) ? "You are the Seller" : "You are the Buyer"}
                </span>
              </div>
              <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
                {chatLoading && <p style={{ color: "var(--text3)", fontSize: "0.8rem", textAlign: "center", marginTop: 40 }}>Loading messages...</p>}
                {!chatLoading && messages.length === 0 && (
                  <p style={{ color: "var(--text3)", fontSize: "0.8rem", textAlign: "center", marginTop: 40 }}>Start the conversation! Ask about the item.</p>
                )}
                {messages.map(msg => {
                  const own = msg.senderId === (user?._id || user?.id) || msg.senderId?._id === (user?._id || user?.id);
                  return (
                    <div key={msg._id} style={{ display: "flex", flexDirection: own ? "row-reverse" : "row", gap: 8, alignItems: "flex-end" }}>
                      <div style={{
                        maxWidth: "75%", padding: "9px 13px",
                        borderRadius: own ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                        background: own ? "linear-gradient(135deg, var(--primary), #8b5cf6)" : "var(--surface2)",
                        color: own ? "#fff" : "var(--text2)", fontSize: "0.85rem", lineHeight: 1.5,
                      }}>
                        {!own && <p style={{ fontSize: "0.65rem", fontWeight: 700, marginBottom: 3, opacity: 0.7 }}>{msg.senderName}</p>}
                        {msg.text}
                      </div>
                      <p style={{ fontSize: "0.6rem", color: "var(--text3)" }}>
                        {new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
                <input
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendChat()}
                  placeholder="Type a message..."
                  style={{ flex: 1, padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: "0.85rem" }}
                />
                <button className="btn btn-primary btn-sm" onClick={sendChat}>Send ↑</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SELL TAB ── */}
      {tab === "sell" && (
        <div className="card" style={{ maxWidth: 520 }}>
          <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: 18 }}>📦 Post a New Listing</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 5 }}>Item Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Engineering Maths Textbook"
                style={{ width: "100%", padding: "9px 12px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: "0.875rem", boxSizing: "border-box" }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 5 }}>Price (₹) *</label>
                <input type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                  placeholder="e.g. 250"
                  style={{ width: "100%", padding: "9px 12px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: "0.875rem", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 5 }}>Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  style={{ width: "100%", padding: "9px 12px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: "0.875rem", boxSizing: "border-box" }}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 5 }}>Photo</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{ border: "2px dashed var(--border2)", borderRadius: 10, padding: "18px 12px", textAlign: "center", cursor: "pointer", background: "var(--bg2)" }}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleImageFile(file);
                }}
              >
                {form.image
                  ? <img src={form.image} alt="preview" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
                  : <p style={{ color: "var(--text3)", fontSize: "0.82rem", margin: 0 }}>📷 Click or drag & drop a JPG photo</p>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/jpeg" style={{ display: "none" }}
                onChange={e => { if (e.target.files[0]) handleImageFile(e.target.files[0]); }} />
              {imgError && <p style={{ marginTop: 6, fontSize: "0.75rem", color: "#ef4444" }}>{imgError}</p>}
              {form.image && (
                <button type="button" onClick={() => { setForm(p => ({ ...p, image: null })); setImgError(""); fileInputRef.current.value = ""; }}
                  style={{ marginTop: 6, fontSize: "0.75rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0 }}>✕ Remove photo</button>
              )}
            </div>
            <div>
              <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text3)", display: "block", marginBottom: 5 }}>Description *</label>
              <textarea value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))}
                placeholder="Condition, edition, any defects..." rows={3}
                style={{ width: "100%", padding: "9px 12px", background: "var(--bg2)", border: "1px solid var(--border2)", borderRadius: 10, fontSize: "0.875rem", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" }} />
            </div>
            <button className="btn btn-primary" onClick={postListing}
              disabled={!form.title.trim() || !form.price || !form.desc.trim() || posting}
              style={{ alignSelf: "flex-start" }}>
              {posting ? "Posting..." : "🚀 Post Listing"}
            </button>
          </div>
        </div>
      )}

      {/* ── MY LISTINGS TAB ── */}
      {tab === "mylistings" && !selectedListing && (
        <>
          {myListings.length === 0 && (
            <div className="card empty">
              <div className="empty-icon">📦</div>
              <p>You haven't posted any listings yet.</p>
              <button className="btn btn-primary btn-sm" style={{ marginTop: 12 }} onClick={() => setTab("sell")}>Post your first item</button>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {myListings.map(l => (
              <div key={l._id} className="card" style={{ opacity: l.sold ? 0.65 : 1 }}>
                {l.image && (
                  <div style={{ width: "100%", height: 140, borderRadius: 10, overflow: "hidden", marginBottom: 10 }}>
                    <img src={l.image} alt="item" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)" }}>{l.title}</p>
                  {l.sold
                    ? <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#ef444422", color: "#ef4444", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>SOLD</span>
                    : <span style={{ fontSize: "0.65rem", fontWeight: 700, background: "#34d39922", color: "#34d399", borderRadius: 6, padding: "2px 8px", flexShrink: 0 }}>ACTIVE</span>
                  }
                </div>
                <p style={{ color: "var(--text3)", fontSize: "0.78rem", marginBottom: 10 }}>{l.desc}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 800, fontSize: "1rem", color: "#34d399" }}>₹{l.price}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{timeAgo(l.createdAt)}</span>
                </div>
                <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-xs" onClick={() => openChat(l, "mylistings")}>💬 Chat</button>
                  {!l.sold && (
                    <>
                      <button className="btn btn-outline btn-xs" onClick={() => markSold(l._id)}>✅ Mark Sold</button>
                      <button className="btn btn-outline btn-xs" style={{ color: "#ef4444", borderColor: "#ef444444" }} onClick={() => deleteListing(l._id)}>🗑 Delete</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
