import { useRef, useState } from "react";
import API from "../api";

export default function IDCard({ user }) {
  const cardRef   = useRef(null);
  const fileInput = useRef(null);
  const [photo, setPhoto]       = useState(user.avatar || null);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);

  const initials = (name) =>
    name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";

  // Convert selected file to base64 and preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setPhoto(ev.target.result); setSaved(false); };
    reader.readAsDataURL(file);
  };

  // Save photo to backend
  const savePhoto = async () => {
    if (!photo || photo === user.avatar) return;
    setSaving(true);
    try {
      await API.put("/users/me/avatar", { avatar: photo });
      // Update localStorage user object
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, avatar: photo }));
      setSaved(true);
      alert("Photo saved successfully!");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save photo");
    } finally { setSaving(false); }
  };

  const removePhoto = () => { setPhoto(null); setSaved(false); };

  const printCard = () => {
    const content = cardRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${user.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; align-items: center;
                   min-height: 100vh; background: #f3f4f6;
                   font-family: 'Segoe UI', sans-serif; }
            .id-card { width: 340px; border-radius: 20px; overflow: hidden;
                       box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
            .card-header { background: linear-gradient(135deg,#6366f1,#8b5cf6);
                           padding: 24px 20px 0; text-align: center; color: #fff; }
            .avatar-wrap { width: 84px; height: 84px; border-radius: 50%;
                           border: 3px solid rgba(255,255,255,0.6);
                           overflow: hidden; margin: 14px auto 0;
                           background: rgba(255,255,255,0.2); }
            .avatar-wrap img { width: 100%; height: 100%; object-fit: cover; }
            .avatar-initials { width: 84px; height: 84px; border-radius: 50%;
                               border: 3px solid rgba(255,255,255,0.6);
                               background: rgba(255,255,255,0.2);
                               display: flex; align-items: center;
                               justify-content: center; font-size: 28px;
                               font-weight: 800; color: #fff; margin: 14px auto 0; }
            .card-body { background: #fff; padding: 18px 20px 14px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; }
            .info-label { font-size: 9px; color: #9ca3af; text-transform: uppercase;
                          letter-spacing: 0.5px; font-weight: 700; }
            .info-val { font-size: 11px; color: #1f2937; font-weight: 600;
                        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
            .card-footer { background: linear-gradient(135deg,#6366f1,#8b5cf6);
                           padding: 11px 20px; display: flex;
                           justify-content: space-between; align-items: center; }
            .divider { height: 1px; background: #f3f4f6; margin: 10px 0; }
            .barcode { text-align: center; font-family: monospace; font-size: 9px;
                       color: #9ca3af; letter-spacing: 3px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); win.close(); }, 600);
  };

  const currentYear = new Date().getFullYear();
  const validUntil  = `${currentYear + 1}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const CardAvatar = () => photo ? (
    <div style={{
      width: 84, height: 84, borderRadius: "50%",
      border: "3px solid rgba(255,255,255,0.6)",
      overflow: "hidden", margin: "14px auto 0",
    }}>
      <img src={photo} alt="student" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  ) : (
    <div style={{
      width: 84, height: 84, borderRadius: "50%",
      background: "rgba(255,255,255,0.2)", border: "3px solid rgba(255,255,255,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 28, fontWeight: 800, color: "#fff", margin: "14px auto 0",
    }}>
      {initials(user.name)}
    </div>
  );

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">🪪 Student ID Card</h2>
        <button className="btn btn-primary btn-sm" onClick={printCard}>🖨️ Print / Download</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 32, alignItems: "start" }}>

        {/* ── ID CARD PREVIEW ── */}
        <div>
          <div ref={cardRef}>
            <div className="id-card" style={{
              width: 340, borderRadius: 20, overflow: "hidden",
              boxShadow: "0 20px 60px rgba(99,102,241,0.3)",
              fontFamily: "'Segoe UI', sans-serif",
            }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "22px 20px 0", textAlign: "center", color: "#fff" }}>
                <p style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", opacity: 0.9 }}>CGUCampus-One</p>
                <p style={{ fontSize: 10, opacity: 0.7, marginTop: 2, letterSpacing: 2, textTransform: "uppercase" }}>Student Identity Card</p>
                <CardAvatar />
                <div style={{ height: 18 }} />
              </div>

              {/* Body */}
              <div style={{ background: "#fff", padding: "18px 20px 14px" }}>
                <p style={{ fontSize: 17, fontWeight: 800, color: "#1f2937", textAlign: "center", marginBottom: 3 }}>{user.name}</p>
                <p style={{ fontSize: 11, color: "#6366f1", fontWeight: 600, textAlign: "center", marginBottom: 14 }}>{user.department || "Computer Science"}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 10 }}>
                  {[
                    ["Roll No",  user.rollNo   || "CS001"],
                    ["Class",    user.class    || "CS-3A"],
                    ["Semester", user.semester ? `Sem ${user.semester}` : "Sem 3"],
                    ["Batch",    user.batch    || "2022-26"],
                    ["Email",    user.email],
                    ["Role",     "Student"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: 9, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 700 }}>{label}</p>
                      <p style={{ fontSize: 11, color: "#1f2937", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div style={{ height: 1, background: "#f3f4f6", margin: "8px 0" }} />
                <p style={{ textAlign: "center", fontFamily: "monospace", fontSize: 9, color: "#9ca3af", letterSpacing: 3 }}>
                  {(user.rollNo || "CS001").padEnd(16, "0").slice(0, 16)}
                </p>
              </div>

              {/* Footer */}
              <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", padding: "11px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>Valid Until</p>
                  <p style={{ fontSize: 12, color: "#fff", fontWeight: 700 }}>{validUntil}</p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 9, color: "rgba(255,255,255,0.7)" }}>ID</p>
                  <p style={{ fontSize: 11, color: "#fff", fontWeight: 700, fontFamily: "monospace" }}>{user._id?.slice(-8).toUpperCase() || "XXXXXXXX"}</p>
                </div>
                <div style={{ width: 40, height: 40, background: "rgba(255,255,255,0.2)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                  🎓
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 16, width: 340, justifyContent: "center" }} onClick={printCard}>
            🖨️ Print ID Card
          </button>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display: "grid", gap: 16 }}>

          {/* Photo Upload */}
          <div className="card">
            <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 14, color: "var(--text)" }}>📷 Profile Photo</p>

            <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
              {/* Photo preview */}
              <div style={{
                width: 90, height: 90, borderRadius: "50%", flexShrink: 0,
                border: "3px solid var(--border2)", overflow: "hidden",
                background: "var(--surface2)", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 28, fontWeight: 800, color: "var(--text3)",
              }}>
                {photo
                  ? <img src={photo} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : initials(user.name)
                }
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: 10 }}>
                  Upload a clear passport-size photo. It will appear on your ID card.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className="btn btn-primary btn-sm" onClick={() => fileInput.current.click()}>
                    📁 Choose Photo
                  </button>
                  {photo && photo !== user.avatar && (
                    <button className="btn btn-success btn-sm" onClick={savePhoto} disabled={saving}>
                      {saving ? "Saving..." : "💾 Save Photo"}
                    </button>
                  )}
                  {photo && (
                    <button className="btn btn-danger btn-sm" onClick={removePhoto}>
                      🗑️ Remove
                    </button>
                  )}
                </div>
                {saved && <p style={{ fontSize: "0.75rem", color: "#10b981", marginTop: 8, fontWeight: 600 }}>✅ Photo saved successfully!</p>}
              </div>
            </div>

            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            <div style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 8, padding: "8px 12px", fontSize: "0.75rem", color: "var(--text3)" }}>
              📌 Accepted formats: JPG, PNG, WEBP &nbsp;|&nbsp; Max size: 2MB &nbsp;|&nbsp; Recommended: passport-size, clear background
            </div>
          </div>

          {/* Student Details */}
          <div className="card">
            <p style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 14, color: "var(--text)" }}>Student Details</p>
            <div style={{ display: "grid", gap: 0 }}>
              {[
                ["Full Name",   user.name],
                ["Email",       user.email],
                ["Roll No",     user.rollNo     || "Not assigned"],
                ["Class",       user.class      || "Not assigned"],
                ["Department",  user.department || "Not assigned"],
                ["Semester",    user.semester   ? `Semester ${user.semester}` : "Not assigned"],
                ["Batch",       user.batch      || "Not assigned"],
                ["Student ID",  user._id?.slice(-8).toUpperCase() || "—"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ fontSize: "0.8rem", color: "var(--text3)", fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: "0.8rem", color: "var(--text)", fontWeight: 600, textAlign: "right", maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 12, padding: "12px 16px", fontSize: "0.8rem", color: "var(--text3)" }}>
            ℹ️ Click <strong>Print / Download</strong> to save your ID card as PDF. In the print dialog, select <strong>"Save as PDF"</strong> as the destination.
          </div>
        </div>
      </div>
    </div>
  );
}
