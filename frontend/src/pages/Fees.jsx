import { useEffect, useState } from "react";
import API from "../api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const FEE_TYPES = ["tuition", "hostel", "exam", "library", "transport", "other"];
const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function Fees({ user }) {
  const [fees, setFees]         = useState([]);
  const [summary, setSummary]    = useState({ total: 0, paid: 0, pending: 0, overdue: 0 });
  const [modal, setModal]        = useState(false);
  const [form, setForm]          = useState({ type: "tuition", status: "pending" });
  const [students, setStudents]  = useState([]);
  const [allFees, setAllFees]    = useState([]);
  const [tab, setTab]            = useState("overview");
  const [paying, setPaying]      = useState(null);
  const [receipt, setReceipt]    = useState(null);
  const [loading, setLoading]    = useState(true);
  const [noticeFilter, setNoticeFilter] = useState("all"); // all | pending | overdue
  const [sending, setSending]    = useState(null);

  const loadFees = async () => {
    try {
      const [feesRes, summaryRes] = await Promise.all([
        API.get("/fees"),
        API.get("/fees/summary"),
      ]);
      setFees(feesRes.data);
      setSummary(summaryRes.data);
      if (user.role === "admin") setAllFees(feesRes.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadFees();
    if (user.role === "admin") {
      API.get("/users?role=student&limit=500")
        .then(r => setStudents(r.data.users || r.data || []))
        .catch(() => {});
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { if (document.body.contains(script)) document.body.removeChild(script); };
  }, []);

  const payFee = async (fee) => {
    if (!window.Razorpay) {
      alert("Payment gateway not loaded. Please refresh and try again.");
      return;
    }
    setPaying(fee._id);
    try {
      const { data } = await API.post(`/payment/order/${fee._id}`);
      const options = {
        key:         data.key,
        amount:      data.amount * 100,
        currency:    "INR",
        name:        "CGUCampus-One",
        description: `${fee.type.charAt(0).toUpperCase() + fee.type.slice(1)} Fee`,
        order_id:    data.orderId,
        image:       "https://via.placeholder.com/150x50?text=CGUCampus",
        handler: async (response) => {
          try {
            const verify = await API.post("/payment/verify", { ...response, feeId: fee._id });
            const updatedFee = verify.data.fee;
            setFees(prev => prev.map(f => f._id === fee._id ? updatedFee : f));
            const s = await API.get("/fees/summary"); setSummary(s.data);
            setReceipt({
              fee: updatedFee,
              paymentId: response.razorpay_payment_id,
              orderId:   response.razorpay_order_id,
              paidAt:    new Date(),
            });
          } catch { alert("Payment done but verification failed. Contact admin with Payment ID: " + response.razorpay_payment_id); }
        },
        prefill:  { name: user.name, email: user.email, contact: user.phone || "" },
        notes:    { studentName: user.name, feeType: fee.type },
        theme:    { color: "#6366f1" },
        modal:    { ondismiss: () => setPaying(null), animation: true },
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (resp) => {
        alert("Payment failed: " + resp.error.description);
        setPaying(null);
      });
      rzp.open();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to initiate payment. Check Razorpay keys in .env");
      setPaying(null);
    }
  };

  const total   = fees.reduce((s, f) => s + (f.amount || 0), 0);
  const paid    = fees.filter(f => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0);
  const pending = fees.filter(f => f.status === "pending").reduce((s, f) => s + (f.amount || 0), 0);
  const overdue = fees.filter(f => f.status === "overdue").reduce((s, f) => s + (f.amount || 0), 0);

  const DEMO_PIE  = [{ name: "Tuition", value: 85000 }, { name: "Hostel", value: 45000 }, { name: "Exam", value: 8000 }, { name: "Library", value: 3000 }, { name: "Transport", value: 12000 }];
  const DEMO_BAR  = [{ type: "tuition", amount: 85000 }, { type: "hostel", amount: 45000 }, { type: "exam", amount: 8000 }, { type: "library", amount: 3000 }, { type: "transport", amount: 12000 }, { type: "other", amount: 5000 }];

  const pieData = fees.length > 0 ? [
    { name: "Paid",    value: paid },
    { name: "Pending", value: pending },
    { name: "Overdue", value: overdue },
  ].filter(d => d.value > 0) : DEMO_PIE;

  const byType = fees.length > 0 ? FEE_TYPES.map(t => ({
    type: t,
    amount: fees.filter(f => f.type === t).reduce((s, f) => s + (f.amount || 0), 0)
  })).filter(d => d.amount > 0) : DEMO_BAR;

  const markPaid = async (id) => {
    try {
      const res = await API.put(`/fees/${id}`, { status: "paid", paidDate: new Date() });
      setFees(fees.map(f => f._id === id ? res.data : f));
      const s = await API.get("/fees/summary"); setSummary(s.data);
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const createFee = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/fees", form);
      setFees([...fees, res.data]);
      setModal(false); setForm({ type: "tuition", status: "pending" });
    } catch (err) { alert(err?.response?.data?.message || "Failed"); }
  };

  const badgeClass = s => s === "paid" ? "badge-success" : s === "overdue" ? "badge-danger" : "badge-warning";

  const isOverdue = f => f.status !== "paid" && f.dueDate && new Date(f.dueDate) < new Date();

  // Build per-student fee summary for admin notice board
  // Merge students list with their fee records
  const studentFeeMap = {};

  // First seed all known students (even those with no fees yet)
  students.forEach(s => {
    studentFeeMap[s._id] = { name: s.name, rollNo: s.rollNo, class: s.class, fees: [] };
  });

  // Then attach fee records
  allFees.forEach(f => {
    const id = f.studentId?.toString();
    if (id && studentFeeMap[id]) {
      studentFeeMap[id].fees.push(f);
    } else if (f.studentName) {
      // fallback: match by name if studentId not found
      const key = f.studentName;
      if (!studentFeeMap[key]) studentFeeMap[key] = { name: f.studentName, rollNo: "", class: "", fees: [] };
      studentFeeMap[key].fees.push(f);
    }
  });

  const studentFeeList = Object.values(studentFeeMap)
    .filter(s => s.fees.length > 0) // only show students who have fee records
    .map(s => ({
      name:    s.name,
      rollNo:  s.rollNo,
      class:   s.class,
      total:   s.fees.reduce((a, f) => a + (f.amount || 0), 0),
      paid:    s.fees.filter(f => f.status === "paid").reduce((a, f) => a + (f.amount || 0), 0),
      pending: s.fees.filter(f => f.status === "pending").reduce((a, f) => a + (f.amount || 0), 0),
      overdue: s.fees.filter(f => f.status === "overdue").reduce((a, f) => a + (f.amount || 0), 0),
      status:  s.fees.some(f => f.status === "overdue") ? "overdue"
             : s.fees.some(f => f.status === "pending") ? "pending" : "paid",
    }));

  const noticeList = noticeFilter === "all" ? studentFeeList
    : studentFeeList.filter(s => s.status === noticeFilter);

  const sendNotice = async (studentName) => {
    setSending(studentName);
    try {
      await API.post("/notifications", {
        title: "Fee Payment Reminder",
        message: `Dear ${studentName}, you have pending/overdue fee payments. Please clear them immediately to avoid penalties. Log in to CGUCampus-One to pay online.`,
        type: "urgent",
        audience: "student",
      });
      alert(`Notice sent to ${studentName}`);
    } catch { alert("Failed to send notice"); }
    finally { setSending(null); }
  };

  const sendBulkNotice = async () => {
    const targets = noticeList.filter(s => s.status !== "paid");
    if (!targets.length) return alert("No students with pending/overdue fees");
    setSending("bulk");
    try {
      await API.post("/notifications", {
        title: "Fee Payment Reminder — Action Required",
        message: "This is a reminder that your fee payment is pending or overdue. Please log in to CGUCampus-One and clear your dues immediately to avoid penalties.",
        type: "urgent",
        audience: "student",
      });
      alert(`Bulk notice sent to ${targets.length} students`);
    } catch { alert("Failed to send bulk notice"); }
    finally { setSending(null); }
  };

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">💳 Fees & Finance</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {user.role === "admin" && (
            <button className="btn btn-primary btn-sm" onClick={() => {
              setModal(true);
              if (students.length === 0) {
                API.get("/users?role=student&limit=500")
                  .then(r => setStudents(r.data.users || r.data || []))
                  .catch(() => {});
              }
            }}>+ Add Fee</button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "overview" ? "active" : ""}`} onClick={() => setTab("overview")}>Overview</button>
        <button className={`tab ${tab === "records" ? "active" : ""}`} onClick={() => setTab("records")}>Records</button>
        {user.role === "admin" && <button className={`tab ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>}
        {user.role === "admin" && <button className={`tab ${tab === "notices" ? "active" : ""}`} onClick={() => setTab("notices")}>Fee Notices {studentFeeList.filter(s => s.status !== "paid").length > 0 && <span className="nav-badge">{studentFeeList.filter(s => s.status !== "paid").length}</span>}</button>}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === "overview" && (
        <>
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <div className="stat-card">
              <div className="stat-icon blue">💳</div>
              <div className="stat-info">
                <p>Total Fees</p>
                <h3 style={{ fontSize: "1.3rem" }}>{loading ? "—" : `₹${summary.total.toLocaleString()}`}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginTop: 2 }}>{loading ? "" : `${summary.count} records`}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">✅</div>
              <div className="stat-info">
                <p>Paid</p>
                <h3 style={{ fontSize: "1.3rem", color: loading ? "var(--text)" : "#10b981" }}>{loading ? "—" : `₹${summary.paid.toLocaleString()}`}</h3>
                <p style={{ fontSize: "0.7rem", color: "#10b981", marginTop: 2 }}>{loading ? "" : summary.total ? `${Math.round((summary.paid / summary.total) * 100)}% cleared` : ""}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">⏳</div>
              <div className="stat-info">
                <p>Pending</p>
                <h3 style={{ fontSize: "1.3rem", color: loading ? "var(--text)" : summary.pending > 0 ? "#f59e0b" : "var(--text)" }}>{loading ? "—" : `₹${summary.pending.toLocaleString()}`}</h3>
                <p style={{ fontSize: "0.7rem", color: "var(--text3)", marginTop: 2 }}>{loading ? "" : summary.pending > 0 ? "Action required" : "All clear"}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red">🚨</div>
              <div className="stat-info">
                <p>Overdue</p>
                <h3 style={{ fontSize: "1.3rem", color: loading ? "var(--text)" : summary.overdue > 0 ? "#ef4444" : "var(--text)" }}>{loading ? "—" : `₹${summary.overdue.toLocaleString()}`}</h3>
                <p style={{ fontSize: "0.7rem", color: summary.overdue > 0 ? "#ef4444" : "var(--text3)", marginTop: 2 }}>{loading ? "" : summary.overdue > 0 ? "⚠️ Pay immediately" : "✔ No overdue"}</p>
              </div>
            </div>
          </div>

          {summary.total > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)" }}>Payment Progress</p>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#10b981" }}>{Math.round((summary.paid / summary.total) * 100)}% paid</span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${(summary.paid / summary.total) * 100}%`, background: "linear-gradient(90deg, #10b981, #34d399)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: "0.75rem", color: "var(--text3)" }}>
                <span>Paid: <strong style={{ color: "#10b981" }}>₹{summary.paid.toLocaleString()}</strong></span>
                <span>Pending: <strong style={{ color: "#f59e0b" }}>₹{summary.pending.toLocaleString()}</strong></span>
                <span>Overdue: <strong style={{ color: "#ef4444" }}>₹{summary.overdue.toLocaleString()}</strong></span>
              </div>
              {summary.overdue > 0 && (
                <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 8, fontWeight: 600 }}>⚠️ ₹{summary.overdue.toLocaleString()} overdue — please clear immediately to avoid penalties</p>
              )}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="card">
              <p className="chart-title">💰 Fee Status Distribution</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="empty"><p>No fee data</p></div>}
            </div>

            <div className="card">
              <p className="chart-title">📊 Fees by Type</p>
              {byType.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={byType}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="type" tick={{ fill: "var(--text3)", fontSize: 10 }} />
                    <YAxis tick={{ fill: "var(--text3)", fontSize: 10 }} />
                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--text)" }} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <div className="empty"><p>No data</p></div>}
            </div>
          </div>

          {/* Pay Now section — student only, shows unpaid fees */}
          {user.role === "student" && fees.filter(f => f.status !== "paid").length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>Pending Payments</p>
                <span style={{ fontSize: "0.75rem", color: "var(--text3)" }}>{fees.filter(f => f.status !== "paid").length} fee(s) due</span>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {fees.filter(f => f.status !== "paid").map(f => (
                  <div key={f._id} style={{
                    display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                    borderRadius: 12, border: `1px solid ${f.status === "overdue" ? "rgba(239,68,68,0.3)" : "var(--border)"}`,
                    background: f.status === "overdue" ? "rgba(239,68,68,0.04)" : "var(--surface2)",
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: f.status === "overdue" ? "rgba(239,68,68,0.1)" : "rgba(99,102,241,0.1)",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem"
                    }}>
                      {f.type === "tuition" ? "\uD83C\uDFEB" : f.type === "hostel" ? "\uD83C\uDFE0" : f.type === "exam" ? "\uD83D\uDCDD" : f.type === "library" ? "\uD83D\uDCDA" : f.type === "transport" ? "\uD83D\uDE8C" : "\uD83D\uDCB0"}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text)", textTransform: "capitalize" }}>{f.type} Fee</p>
                        <span className={`badge ${f.status === "overdue" ? "badge-danger" : "badge-warning"}`} style={{ fontSize: "0.65rem" }}>{f.status}</span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
                        {f.semester ? f.semester + " | " : ""}
                        {f.dueDate ? "Due: " + new Date(f.dueDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: "JetBrains Mono, monospace", color: f.status === "overdue" ? "#ef4444" : "var(--text)", marginBottom: 6 }}>
                        Rs. {f.amount?.toLocaleString()}
                      </p>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={paying === f._id}
                        onClick={() => payFee(f)}
                        style={{ background: f.status === "overdue" ? "linear-gradient(135deg,#ef4444,#dc2626)" : "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", padding: "6px 16px", fontWeight: 700 }}
                      >
                        {paying === f._id ? "Processing..." : "Pay Now"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, fontSize: "0.78rem", color: "var(--text3)" }}>
                Payments are secured by Razorpay. Accepted: UPI, Debit/Credit Card, Net Banking, Wallets.
              </div>
            </div>
          )}

          {user.role === "student" && fees.filter(f => f.status !== "paid").length === 0 && fees.length > 0 && (
            <div style={{ marginTop: 20, padding: "20px", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, textAlign: "center" }}>
              <p style={{ fontSize: "1.5rem", marginBottom: 8 }}>OK</p>
              <p style={{ fontWeight: 700, color: "#10b981", fontSize: "0.95rem" }}>All fees paid!</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: 4 }}>You have no pending or overdue fees.</p>
            </div>
          )}
        </>
      )}

      {/* ── RECORDS ── */}
      {tab === "records" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Type</th><th>Amount</th><th>Semester</th><th>Due Date</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {fees.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 40 }}>No fee records found</td></tr>}
                {fees.map(f => (
                  <tr key={f._id} style={{ background: isOverdue(f) ? "rgba(239,68,68,0.04)" : "transparent" }}>
                    <td style={{ textTransform: "capitalize", fontWeight: 600 }}>
                      {isOverdue(f) && <span style={{ color: "#ef4444", marginRight: 4 }}>⚠️</span>}
                      {f.type}
                    </td>
                    <td style={{ fontWeight: 700, fontFamily: "JetBrains Mono, monospace" }}>₹{f.amount?.toLocaleString()}</td>
                    <td>{f.semester || "—"}</td>
                    <td style={{ color: isOverdue(f) ? "#ef4444" : "var(--text2)" }}>
                      {f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td><span className={`badge ${badgeClass(f.status)}`}>{f.status}</span></td>
                    <td>
                      {f.status !== "paid" && user.role === "admin" && (
                        <button className="btn btn-success btn-sm" onClick={() => markPaid(f._id)}>Mark Paid</button>
                      )}
                      {f.status !== "paid" && user.role === "student" && (
                        <button className="btn btn-primary btn-sm" disabled={paying === f._id}
                          onClick={() => payFee(f)}
                          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", border: "none", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                          {paying === f._id ? "Processing..." : "💳 Pay Now"}
                        </button>
                      )}
                      {f.status === "paid" && (
                        <div>
                          <span style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: 600 }}>✓ Paid</span>
                          {f.paidDate && <p style={{ fontSize: "0.7rem", color: "var(--text3)" }}>{new Date(f.paidDate).toLocaleDateString("en-IN")}</p>}
                          {f.paymentId && <p style={{ fontSize: "0.65rem", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>{f.paymentId.slice(0,18)}...</p>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ADMIN ANALYTICS ── */}
      {tab === "analytics" && user.role === "admin" && (
        <div className="card">
          <p className="chart-title">📊 Collection Summary</p>
          <div className="stat-grid">
            {[
              ["Total Collected",  `₹${summary.paid.toLocaleString()}`,                    "green",  "💰"],
              ["Outstanding",      `₹${(summary.pending + summary.overdue).toLocaleString()}`, "orange", "⏳"],
              ["Overdue Amount",   `₹${summary.overdue.toLocaleString()}`,                  "red",    "🚨"],
              ["Collection Rate",  `${summary.total ? Math.round((summary.paid / summary.total) * 100) : 0}%`, "blue", "📊"],
            ].map(([l, v, c, i]) => (
              <div key={l} className="stat-card">
                <div className={`stat-icon ${c}`}>{i}</div>
                <div className="stat-info"><p>{l}</p><h3 style={{ fontSize: "1.2rem" }}>{v}</h3></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FEE NOTICES (ADMIN) ── */}
      {tab === "notices" && user.role === "admin" && (
        <div style={{ display: "grid", gap: 16 }}>

          {/* Header + bulk action */}
          <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>Student Fee Notice Board</p>
              <p style={{ fontSize: "0.78rem", color: "var(--text3)", marginTop: 2 }}>Send payment reminders to students with pending or overdue fees</p>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {/* Filter buttons */}
              {[["all","All"],["pending","Pending"],["overdue","Overdue"],["paid","Paid"]].map(([val, label]) => (
                <button key={val} onClick={() => setNoticeFilter(val)}
                  className={`btn btn-xs ${noticeFilter === val ? "btn-primary" : "btn-outline"}`}
                  style={{ textTransform: "capitalize" }}>{label}</button>
              ))}
              <button className="btn btn-danger btn-sm" disabled={sending === "bulk"}
                onClick={sendBulkNotice}>
                {sending === "bulk" ? "Sending..." : "Send Bulk Notice"}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="stat-grid">
            {[
              ["Total Students", studentFeeList.length,                                    "blue",   "students"],
              ["All Paid",       studentFeeList.filter(s => s.status === "paid").length,    "green",  "paid"],
              ["Pending",        studentFeeList.filter(s => s.status === "pending").length, "orange", "pending"],
              ["Overdue",        studentFeeList.filter(s => s.status === "overdue").length, "red",    "overdue"],
            ].map(([label, val, color]) => (
              <div key={label} className="stat-card">
                <div className={`stat-icon ${color}`}></div>
                <div className="stat-info"><p>{label}</p><h3>{val}</h3></div>
              </div>
            ))}
          </div>

          {/* Student list */}
          {noticeList.length === 0 ? (
            <div className="card empty"><div className="empty-icon">No students found</div></div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Class</th>
                      <th>Total Fees</th>
                      <th>Paid</th>
                      <th>Pending</th>
                      <th>Overdue</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticeList.map((s, i) => (
                      <tr key={i} style={{ background: s.status === "overdue" ? "rgba(239,68,68,0.03)" : "transparent" }}>
                        <td style={{ fontWeight: 600 }}>{s.name}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text3)", fontFamily: "JetBrains Mono, monospace" }}>{s.rollNo || "—"}</td>
                        <td style={{ fontSize: "0.8rem", color: "var(--text3)" }}>{s.class || "—"}</td>
                        <td style={{ fontFamily: "JetBrains Mono, monospace", fontWeight: 600 }}>Rs. {s.total.toLocaleString()}</td>
                        <td style={{ color: "#10b981", fontWeight: 600 }}>Rs. {s.paid.toLocaleString()}</td>
                        <td style={{ color: s.pending > 0 ? "#f59e0b" : "var(--text3)", fontWeight: 600 }}>Rs. {s.pending.toLocaleString()}</td>
                        <td style={{ color: s.overdue > 0 ? "#ef4444" : "var(--text3)", fontWeight: 600 }}>Rs. {s.overdue.toLocaleString()}</td>
                        <td>
                          <span className={`badge ${s.status === "paid" ? "badge-success" : s.status === "overdue" ? "badge-danger" : "badge-warning"}`}
                            style={{ textTransform: "capitalize" }}>{s.status}</span>
                        </td>
                        <td>
                          {s.status !== "paid" ? (
                            <button className="btn btn-outline btn-xs" disabled={sending === s.name}
                              onClick={() => sendNotice(s.name)}
                              style={{ color: s.status === "overdue" ? "#ef4444" : "#f59e0b", borderColor: s.status === "overdue" ? "#ef4444" : "#f59e0b" }}>
                              {sending === s.name ? "Sending..." : "Send Notice"}
                            </button>
                          ) : (
                            <span style={{ fontSize: "0.75rem", color: "#10b981", fontWeight: 600 }}>Cleared</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PAYMENT RECEIPT MODAL ── */}
      {receipt && (
        <div className="modal-overlay" onClick={() => setReceipt(null)}>
          <div className="modal" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>✅ Payment Successful</h3>
              <button className="modal-close" onClick={() => setReceipt(null)}>✕</button>
            </div>
            <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "2px solid #10b981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", margin: "0 auto 16px" }}>✅</div>
              <p style={{ fontWeight: 800, fontSize: "1.2rem", color: "var(--text)", marginBottom: 4 }}>Payment Confirmed!</p>
              <p style={{ fontSize: "0.85rem", color: "var(--text3)" }}>Your fee has been successfully paid.</p>
            </div>

            <div style={{ background: "var(--surface2)", borderRadius: 12, padding: 16, display: "grid", gap: 10, marginBottom: 20 }}>
              {[
                ["Student",    user.name],
                ["Fee Type",   receipt.fee?.type?.charAt(0).toUpperCase() + receipt.fee?.type?.slice(1)],
                ["Amount",     `₹${receipt.fee?.amount?.toLocaleString()}`],
                ["Payment ID", receipt.paymentId],
                ["Order ID",   receipt.orderId],
                ["Date & Time",receipt.paidAt?.toLocaleString("en-IN")],
                ["Status",     "Paid"],
              ].map(([label, val]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                  <span style={{ color: "var(--text3)", fontWeight: 600 }}>{label}</span>
                  <span style={{ color: label === "Status" ? "#10b981" : "var(--text)", fontWeight: 700, fontFamily: label === "Payment ID" || label === "Order ID" ? "JetBrains Mono, monospace" : "inherit", fontSize: label === "Payment ID" || label === "Order ID" ? "0.72rem" : "0.82rem" }}>{val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }}
                onClick={() => {
                  const w = window.open("", "_blank");
                  w.document.write(`<html><head><title>Fee Receipt</title><style>body{font-family:sans-serif;padding:40px;max-width:500px;margin:auto}h2{color:#6366f1}table{width:100%;border-collapse:collapse;margin-top:20px}td{padding:10px;border-bottom:1px solid #eee}td:first-child{color:#666;font-weight:600}td:last-child{font-weight:700;text-align:right}.footer{margin-top:30px;text-align:center;color:#999;font-size:12px}</style></head><body><h2>CGUCampus-One</h2><p>Fee Payment Receipt</p><table><tr><td>Student</td><td>${user.name}</td></tr><tr><td>Fee Type</td><td>${receipt.fee?.type}</td></tr><tr><td>Amount</td><td>&#8377;${receipt.fee?.amount?.toLocaleString()}</td></tr><tr><td>Payment ID</td><td>${receipt.paymentId}</td></tr><tr><td>Order ID</td><td>${receipt.orderId}</td></tr><tr><td>Date</td><td>${receipt.paidAt?.toLocaleString("en-IN")}</td></tr><tr><td>Status</td><td style="color:#10b981">PAID</td></tr></table><div class="footer">This is a computer-generated receipt. No signature required.</div></body></html>`);
                  w.document.close(); setTimeout(() => w.print(), 400);
                }}>
                🖨️ Print Receipt
              </button>
              <button className="btn btn-success" style={{ flex: 1, justifyContent: "center" }} onClick={() => setReceipt(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD FEE MODAL ── */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>➕ Add Fee Record</h3>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={createFee}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Student</label>
                  <select required onChange={e => {
                    const s = students.find(st => st._id === e.target.value);
                    setForm({ ...form, studentId: e.target.value, studentName: s?.name || "" });
                  }}>
                    <option value="">{students.length === 0 ? "Loading students..." : `Select student (${students.length} available)`}</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.name}{s.rollNo ? ` — ${s.rollNo}` : ""}{s.class ? ` (${s.class})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Fee Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {FEE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input type="number" required placeholder="e.g. 25000" onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <input placeholder="e.g. Sem 3" onChange={e => setForm({ ...form, semester: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" onChange={e => setForm({ ...form, dueDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 16, width: "100%", justifyContent: "center" }} type="submit">Add Fee Record</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
