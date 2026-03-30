import { useEffect, useState } from "react";
import API from "../api";

const CATALOG = [
  { title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262033848", genre: "CS" },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", genre: "CS" },
  { title: "The Pragmatic Programmer", author: "Hunt & Thomas", isbn: "978-0135957059", genre: "CS" },
  { title: "Engineering Mathematics", author: "B.S. Grewal", isbn: "978-8174091955", genre: "Math" },
  { title: "Physics for Scientists", author: "Serway & Jewett", isbn: "978-1133947271", genre: "Physics" },
  { title: "Organic Chemistry", author: "Morrison & Boyd", isbn: "978-8177583977", genre: "Chemistry" },
  { title: "Data Structures in C", author: "Tanenbaum", isbn: "978-0131997462", genre: "CS" },
  { title: "Operating System Concepts", author: "Silberschatz", isbn: "978-1118063330", genre: "CS" },
  { title: "Database System Concepts", author: "Korth & Sudarshan", isbn: "978-0073523323", genre: "CS" },
  { title: "Computer Networks", author: "Andrew Tanenbaum", isbn: "978-0132126953", genre: "CS" },
];

export default function Library({ user }) {
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("catalog");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");

  useEffect(() => { API.get("/library").then(r => setRequests(r.data)).catch(() => {}); }, []);

  const requestBook = async (book) => {
    try {
      const res = await API.post("/library", {
        bookTitle: book.title, author: book.author, isbn: book.isbn,
        studentName: user.name, requestType: "issue",
      });
      setRequests([res.data, ...requests]);
      setModal(null);
      alert("Book request submitted! Collect from library within 2 days.");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to request book");
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await API.put(`/library/${id}`, { status });
      setRequests(requests.map(r => r._id === id ? res.data : r));
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update");
    }
  };

  const isRequested = (isbn) => requests.some(r => r.isbn === isbn && r.status !== "returned" && r.status !== "rejected");

  const filtered = CATALOG.filter(b =>
    (genre === "all" || b.genre === genre) &&
    (b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()))
  );

  const statusBadge = (s) => ({ pending: "badge-warning", approved: "badge-info", returned: "badge-success", rejected: "badge-danger" }[s] || "badge-gray");
  const genres = ["all", ...new Set(CATALOG.map(b => b.genre))];

  const isOverdue = (r) => r.status === "approved" && r.dueDate && new Date(r.dueDate) < new Date();

  return (
    <div className="page">
      <div className="section-header">
        <h2 className="section-title">📖 Library</h2>
        <div className="tabs" style={{ margin: 0 }}>
          <button className={`tab ${tab === "catalog" ? "active" : ""}`} onClick={() => setTab("catalog")}>Catalog</button>
          <button className={`tab ${tab === "mybooks" ? "active" : ""}`} onClick={() => setTab("mybooks")}>
            My Books {requests.filter(r => r.status === "approved").length > 0 && `(${requests.filter(r => r.status === "approved").length})`}
          </button>
          {user.role !== "student" && (
            <button className={`tab ${tab === "manage" ? "active" : ""}`} onClick={() => setTab("manage")}>Manage</button>
          )}
        </div>
      </div>

      {tab === "catalog" && (
        <>
          <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
            <input placeholder="🔍 Search books or authors..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.875rem" }} />
            <div className="tabs" style={{ margin: 0 }}>
              {genres.map(g => (
                <button key={g} className={`tab ${genre === g ? "active" : ""}`} onClick={() => setGenre(g)}
                  style={{ textTransform: "capitalize" }}>{g}</button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {filtered.map(book => {
              const requested = isRequested(book.isbn);
              return (
                <div key={book.isbn} className="card" style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 48, height: 64, borderRadius: 6, flexShrink: 0,
                    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem"
                  }}>📚</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 2 }}>{book.title}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{book.author}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>ISBN: {book.isbn}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                      <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{book.genre}</span>
                      {requested ? (
                        <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>Requested</span>
                      ) : (
                        <button className="btn btn-primary btn-sm" onClick={() => setModal(book)}>Request</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === "mybooks" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Book</th><th>Author</th><th>Type</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No book requests</td></tr>}
                {requests.map(r => (
                  <tr key={r._id}>
                    <td style={{ fontWeight: 500 }}>{r.bookTitle}</td>
                    <td>{r.author}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.requestType}</td>
                    <td>
                      {r.dueDate ? (
                        <span style={{ color: isOverdue(r) ? "#ef4444" : "#374151" }}>
                          {isOverdue(r) ? "⚠️ " : ""}{new Date(r.dueDate).toLocaleDateString()}
                        </span>
                      ) : "—"}
                    </td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td>
                      {r.status === "approved" && (
                        <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, "returned")}>Return</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "manage" && user.role !== "student" && (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student</th><th>Book</th><th>Type</th><th>Due Date</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text3)", padding: 32 }}>No requests</td></tr>}
                {requests.map(r => (
                  <tr key={r._id}>
                    <td>{r.studentName}</td>
                    <td style={{ fontWeight: 500 }}>{r.bookTitle}</td>
                    <td style={{ textTransform: "capitalize" }}>{r.requestType}</td>
                    <td>{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}</td>
                    <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                    <td style={{ display: "flex", gap: 6 }}>
                      {r.status === "pending" && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => updateStatus(r._id, "approved")}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => updateStatus(r._id, "rejected")}>Reject</button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button className="btn btn-outline btn-sm" onClick={() => updateStatus(r._id, "returned")}>Mark Returned</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Request Book</h3>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600 }}>{modal.title}</p>
              <p style={{ color: "var(--text3)", fontSize: "0.875rem" }}>{modal.author}</p>
              <p style={{ fontSize: "0.8rem", color: "var(--text3)", marginTop: 4 }}>Due date will be 14 days from today</p>
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => requestBook(modal)}>
              Confirm Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
