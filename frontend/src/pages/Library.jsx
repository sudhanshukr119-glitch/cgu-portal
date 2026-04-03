import { useEffect, useState, useRef } from "react";
import API from "../api";

// branch = engineering branch | genre = subject/topic
const CATALOG = [
  // ── COMMON (All Branches) ────────────────────────────────────────────────
  { title: "Engineering Mathematics Vol. 1", author: "B.S. Grewal", isbn: "978-8174091955", branch: "Common", genre: "Mathematics" },
  { title: "Engineering Mathematics Vol. 2", author: "B.S. Grewal", isbn: "978-8174091956", branch: "Common", genre: "Mathematics" },
  { title: "Higher Engineering Mathematics", author: "H.K. Dass", isbn: "978-8121903455", branch: "Common", genre: "Mathematics" },
  { title: "Engineering Physics", author: "R.K. Gaur & S.L. Gupta", isbn: "978-8171960774", branch: "Common", genre: "Physics" },
  { title: "A Textbook of Engineering Chemistry", author: "S.S. Dara", isbn: "978-8121903929", branch: "Common", genre: "Chemistry" },
  { title: "Engineering Drawing", author: "N.D. Bhatt", isbn: "978-9385039140", branch: "Common", genre: "Drawing" },
  { title: "Fundamentals of Electrical Engineering", author: "Rajendra Prasad", isbn: "978-8120348677", branch: "Common", genre: "Electrical" },
  { title: "Basic Electronics", author: "D.P. Kothari & I.J. Nagrath", isbn: "978-0070669116", branch: "Common", genre: "Electronics" },
  { title: "Communication Skills for Engineers", author: "Sunita Mishra", isbn: "978-8131733264", branch: "Common", genre: "Soft Skills" },
  { title: "Environmental Science", author: "N.N. Basak", isbn: "978-0070669117", branch: "Common", genre: "Environment" },

  // ── COMPUTER SCIENCE & ENGINEERING (CSE) ────────────────────────────────
  { title: "Introduction to Algorithms (CLRS)", author: "Cormen, Leiserson, Rivest & Stein", isbn: "978-0262033848", branch: "CSE", genre: "Algorithms" },
  { title: "Data Structures Using C", author: "Reema Thareja", isbn: "978-0198099307", branch: "CSE", genre: "Data Structures" },
  { title: "Data Structures and Algorithms in C", author: "A.K. Tanenbaum", isbn: "978-0131997462", branch: "CSE", genre: "Data Structures" },
  { title: "Operating System Concepts", author: "Silberschatz, Galvin & Gagne", isbn: "978-1118063330", branch: "CSE", genre: "Operating Systems" },
  { title: "Modern Operating Systems", author: "Andrew S. Tanenbaum", isbn: "978-0136006633", branch: "CSE", genre: "Operating Systems" },
  { title: "Database System Concepts", author: "Korth, Silberschatz & Sudarshan", isbn: "978-0073523323", branch: "CSE", genre: "Databases" },
  { title: "Computer Networks", author: "Andrew S. Tanenbaum", isbn: "978-0132126953", branch: "CSE", genre: "Networks" },
  { title: "Computer Networking: A Top-Down Approach", author: "Kurose & Ross", isbn: "978-0136079675", branch: "CSE", genre: "Networks" },
  { title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", branch: "CSE", genre: "Software Engineering" },
  { title: "Software Engineering", author: "Roger S. Pressman", isbn: "978-0078022128", branch: "CSE", genre: "Software Engineering" },
  { title: "Compiler Design (Dragon Book)", author: "Alfred V. Aho et al.", isbn: "978-0321486813", branch: "CSE", genre: "Compiler Design" },
  { title: "Computer Organization and Architecture", author: "William Stallings", isbn: "978-0134101613", branch: "CSE", genre: "Computer Architecture" },
  { title: "Digital Design", author: "M. Morris Mano", isbn: "978-0132774208", branch: "CSE", genre: "Digital Logic" },
  { title: "Discrete Mathematics and Its Applications", author: "Kenneth H. Rosen", isbn: "978-0073383095", branch: "CSE", genre: "Discrete Math" },
  { title: "Theory of Computation", author: "Michael Sipser", isbn: "978-1133187790", branch: "CSE", genre: "Theory of Computation" },
  { title: "Artificial Intelligence: A Modern Approach", author: "Russell & Norvig", isbn: "978-0136042594", branch: "CSE", genre: "AI & ML" },
  { title: "Deep Learning", author: "Goodfellow, Bengio & Courville", isbn: "978-0262035613", branch: "CSE", genre: "AI & ML" },
  { title: "Pattern Recognition and Machine Learning", author: "Christopher Bishop", isbn: "978-0387310732", branch: "CSE", genre: "AI & ML" },
  { title: "Cryptography and Network Security", author: "William Stallings", isbn: "978-0134444284", branch: "CSE", genre: "Security" },
  { title: "Computer Graphics: Principles and Practice", author: "Foley, van Dam et al.", isbn: "978-0201848403", branch: "CSE", genre: "Graphics" },

  // ── INFORMATION TECHNOLOGY (IT) ──────────────────────────────────────────
  { title: "Web Technologies", author: "A. Radha Krishna Rao", isbn: "978-8173716386", branch: "IT", genre: "Web Development" },
  { title: "JavaScript: The Good Parts", author: "Douglas Crockford", isbn: "978-0596517748", branch: "IT", genre: "Web Development" },
  { title: "Learning Python", author: "Mark Lutz", isbn: "978-1449355739", branch: "IT", genre: "Programming" },
  { title: "Java: The Complete Reference", author: "Herbert Schildt", isbn: "978-1260440232", branch: "IT", genre: "Programming" },
  { title: "Cloud Computing: Concepts, Technology & Architecture", author: "Thomas Erl", isbn: "978-0133387520", branch: "IT", genre: "Cloud Computing" },
  { title: "Big Data: A Revolution", author: "Viktor Mayer-Schonberger", isbn: "978-0544002692", branch: "IT", genre: "Big Data" },
  { title: "Information Security: Principles and Practice", author: "Mark Stamp", isbn: "978-1119505907", branch: "IT", genre: "Security" },
  { title: "System Analysis and Design", author: "Elias M. Awad", isbn: "978-8120320857", branch: "IT", genre: "Systems" },
  { title: "Human Computer Interaction", author: "Alan Dix et al.", isbn: "978-0130461094", branch: "IT", genre: "HCI" },
  { title: "Software Project Management", author: "Bob Hughes & Mike Cotterell", isbn: "978-0077122799", branch: "IT", genre: "Project Management" },

  // ── ELECTRONICS & COMMUNICATION ENGINEERING (ECE) ───────────────────────
  { title: "Electronic Devices and Circuit Theory", author: "Robert Boylestad", isbn: "978-0132622264", branch: "ECE", genre: "Analog Electronics" },
  { title: "Microelectronics Circuits", author: "Sedra & Smith", isbn: "978-0199339136", branch: "ECE", genre: "Analog Electronics" },
  { title: "Digital Electronics", author: "R.P. Jain", isbn: "978-0070669115", branch: "ECE", genre: "Digital Electronics" },
  { title: "Signals and Systems", author: "Oppenheim & Willsky", isbn: "978-0138147570", branch: "ECE", genre: "Signals & Systems" },
  { title: "Communication Systems", author: "Simon Haykin", isbn: "978-0471178699", branch: "ECE", genre: "Communications" },
  { title: "Principles of Communication Systems", author: "Taub & Schilling", isbn: "978-0070669118", branch: "ECE", genre: "Communications" },
  { title: "Electromagnetic Field Theory", author: "Matthew Sadiku", isbn: "978-0073380667", branch: "ECE", genre: "Electromagnetics" },
  { title: "Antenna Theory: Analysis and Design", author: "Constantine Balanis", isbn: "978-1118642061", branch: "ECE", genre: "Antennas" },
  { title: "VLSI Design", author: "Weste & Harris", isbn: "978-0321547996", branch: "ECE", genre: "VLSI" },
  { title: "Microprocessors and Microcontrollers", author: "N. Senthil Kumar", isbn: "978-0198065449", branch: "ECE", genre: "Microprocessors" },
  { title: "Control Systems Engineering", author: "Norman S. Nise", isbn: "978-1118170519", branch: "ECE", genre: "Control Systems" },
  { title: "Digital Signal Processing", author: "Proakis & Manolakis", isbn: "978-0131873742", branch: "ECE", genre: "DSP" },
  { title: "Wireless Communications", author: "Andrea Goldsmith", isbn: "978-0521837163", branch: "ECE", genre: "Wireless" },
  { title: "Optical Fiber Communications", author: "John M. Senior", isbn: "978-0130326812", branch: "ECE", genre: "Optical Comm" },

  // ── ELECTRICAL ENGINEERING (EE) ──────────────────────────────────────────
  { title: "Electrical Machines", author: "I.J. Nagrath & D.P. Kothari", isbn: "978-0070669119", branch: "EE", genre: "Electrical Machines" },
  { title: "Power Systems Engineering", author: "Nagrath & Kothari", isbn: "978-0070669120", branch: "EE", genre: "Power Systems" },
  { title: "Power Electronics", author: "M.H. Rashid", isbn: "978-0133125900", branch: "EE", genre: "Power Electronics" },
  { title: "Electrical Circuit Analysis", author: "A. Chakrabarti", isbn: "978-8177000010", branch: "EE", genre: "Circuit Analysis" },
  { title: "Control Systems", author: "A. Nagoor Kani", isbn: "978-9380578781", branch: "EE", genre: "Control Systems" },
  { title: "Electromagnetic Theory", author: "W.H. Hayt", isbn: "978-0073380668", branch: "EE", genre: "Electromagnetics" },
  { title: "Switchgear and Protection", author: "Sunil S. Rao", isbn: "978-8177000011", branch: "EE", genre: "Protection" },
  { title: "High Voltage Engineering", author: "M.S. Naidu & V. Kamaraju", isbn: "978-0070669121", branch: "EE", genre: "High Voltage" },
  { title: "Utilization of Electrical Energy", author: "J.B. Gupta", isbn: "978-8177000012", branch: "EE", genre: "Utilization" },
  { title: "Renewable Energy Sources", author: "G.D. Rai", isbn: "978-8177000013", branch: "EE", genre: "Renewable Energy" },

  // ── MECHANICAL ENGINEERING (ME) ──────────────────────────────────────────
  { title: "Engineering Mechanics", author: "R.C. Hibbeler", isbn: "978-0133918922", branch: "ME", genre: "Mechanics" },
  { title: "Strength of Materials", author: "R.K. Bansal", isbn: "978-8180141416", branch: "ME", genre: "Strength of Materials" },
  { title: "Theory of Machines", author: "S.S. Rattan", isbn: "978-0070669122", branch: "ME", genre: "Theory of Machines" },
  { title: "Machine Design", author: "V.B. Bhandari", isbn: "978-0070669123", branch: "ME", genre: "Machine Design" },
  { title: "Thermodynamics: An Engineering Approach", author: "Cengel & Boles", isbn: "978-0073398174", branch: "ME", genre: "Thermodynamics" },
  { title: "Fluid Mechanics and Hydraulic Machines", author: "R.K. Bansal", isbn: "978-8180141447", branch: "ME", genre: "Fluid Mechanics" },
  { title: "Heat and Mass Transfer", author: "R.K. Rajput", isbn: "978-8121924122", branch: "ME", genre: "Heat Transfer" },
  { title: "Manufacturing Engineering and Technology", author: "Kalpakjian & Schmid", isbn: "978-0133128741", branch: "ME", genre: "Manufacturing" },
  { title: "Metrology and Quality Control", author: "R.K. Jain", isbn: "978-8174091957", branch: "ME", genre: "Metrology" },
  { title: "Refrigeration and Air Conditioning", author: "C.P. Arora", isbn: "978-0070669124", branch: "ME", genre: "HVAC" },
  { title: "Automobile Engineering", author: "Kirpal Singh", isbn: "978-8174091958", branch: "ME", genre: "Automobile" },
  { title: "Finite Element Methods", author: "P. Seshu", isbn: "978-8120323155", branch: "ME", genre: "FEM" },

  // ── CIVIL ENGINEERING (CE) ───────────────────────────────────────────────
  { title: "Structural Analysis", author: "R.C. Hibbeler", isbn: "978-0134610672", branch: "Civil", genre: "Structural Analysis" },
  { title: "Reinforced Concrete Design", author: "Pillai & Menon", isbn: "978-0070669125", branch: "Civil", genre: "RCC Design" },
  { title: "Steel Structures Design", author: "L.S. Negi", isbn: "978-0070669126", branch: "Civil", genre: "Steel Design" },
  { title: "Soil Mechanics and Foundation Engineering", author: "K.R. Arora", isbn: "978-8180141461", branch: "Civil", genre: "Geotechnical" },
  { title: "Fluid Mechanics", author: "Modi & Seth", isbn: "978-8174091959", branch: "Civil", genre: "Fluid Mechanics" },
  { title: "Surveying Vol. 1", author: "B.C. Punmia", isbn: "978-8131807286", branch: "Civil", genre: "Surveying" },
  { title: "Surveying Vol. 2", author: "B.C. Punmia", isbn: "978-8131807287", branch: "Civil", genre: "Surveying" },
  { title: "Transportation Engineering", author: "C.E.G. Justo & S.K. Khanna", isbn: "978-8174091960", branch: "Civil", genre: "Transportation" },
  { title: "Environmental Engineering", author: "B.C. Punmia", isbn: "978-8131807288", branch: "Civil", genre: "Environmental Engg" },
  { title: "Irrigation Engineering", author: "R.K. Sharma & T.K. Sharma", isbn: "978-8174091961", branch: "Civil", genre: "Irrigation" },
  { title: "Concrete Technology", author: "M.S. Shetty", isbn: "978-8121900034", branch: "Civil", genre: "Concrete Tech" },
  { title: "Building Materials and Construction", author: "P.C. Varghese", isbn: "978-8120321540", branch: "Civil", genre: "Construction" },

  // ── CHEMICAL ENGINEERING (ChE) ───────────────────────────────────────────
  { title: "Chemical Engineering Vol. 1", author: "Coulson & Richardson", isbn: "978-0750644440", branch: "Chemical", genre: "Chemical Engg" },
  { title: "Chemical Engineering Vol. 2", author: "Coulson & Richardson", isbn: "978-0750644457", branch: "Chemical", genre: "Chemical Engg" },
  { title: "Mass Transfer Operations", author: "Robert E. Treybal", isbn: "978-0070669127", branch: "Chemical", genre: "Mass Transfer" },
  { title: "Chemical Reaction Engineering", author: "Octave Levenspiel", isbn: "978-0471254249", branch: "Chemical", genre: "Reaction Engg" },
  { title: "Process Dynamics and Control", author: "Seborg, Edgar & Mellichamp", isbn: "978-0470128671", branch: "Chemical", genre: "Process Control" },
  { title: "Introduction to Chemical Engineering Thermodynamics", author: "Smith, Van Ness & Abbott", isbn: "978-0073104454", branch: "Chemical", genre: "Thermodynamics" },
  { title: "Unit Operations of Chemical Engineering", author: "McCabe, Smith & Harriott", isbn: "978-0073104455", branch: "Chemical", genre: "Unit Operations" },
  { title: "Organic Chemistry", author: "Morrison & Boyd", isbn: "978-8177583977", branch: "Chemical", genre: "Chemistry" },
  { title: "Physical Chemistry", author: "P.W. Atkins", isbn: "978-0198769866", branch: "Chemical", genre: "Chemistry" },
  { title: "Heat Transfer", author: "J.P. Holman", isbn: "978-0073529363", branch: "Chemical", genre: "Heat Transfer" },

  // ── INFORMATION SCIENCE & ENGINEERING (ISE) ──────────────────────────────
  { title: "Computer Organization", author: "Carl Hamacher", isbn: "978-0070669128", branch: "ISE", genre: "Computer Org" },
  { title: "Principles of Programming Languages", author: "Robert W. Sebesta", isbn: "978-0133943023", branch: "ISE", genre: "Programming Languages" },
  { title: "Software Testing", author: "Ron Patton", isbn: "978-0672327988", branch: "ISE", genre: "Testing" },
  { title: "Object Oriented Analysis and Design", author: "Grady Booch", isbn: "978-0805353402", branch: "ISE", genre: "OOAD" },
  { title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", branch: "ISE", genre: "Design Patterns" },
  { title: "Unix and Shell Programming", author: "B.A. Forouzan", isbn: "978-0070669129", branch: "ISE", genre: "Unix/Linux" },
  { title: "Data Warehousing and Data Mining", author: "Alex Berson", isbn: "978-0070669130", branch: "ISE", genre: "Data Mining" },
  { title: "Mobile Computing", author: "Raj Kamal", isbn: "978-0070669131", branch: "ISE", genre: "Mobile Computing" },
  { title: "Internet of Things", author: "Arshdeep Bahga", isbn: "978-0996025515", branch: "ISE", genre: "IoT" },
  { title: "Cyber Security Essentials", author: "James Graham", isbn: "978-1439851234", branch: "ISE", genre: "Cyber Security" },

  // ── AEROSPACE ENGINEERING (AE) ───────────────────────────────────────────
  { title: "Introduction to Flight", author: "John D. Anderson", isbn: "978-0078027673", branch: "Aerospace", genre: "Aerodynamics" },
  { title: "Aerodynamics for Engineers", author: "Bertin & Cummings", isbn: "978-0132832885", branch: "Aerospace", genre: "Aerodynamics" },
  { title: "Aircraft Structures for Engineering Students", author: "T.H.G. Megson", isbn: "978-0080969053", branch: "Aerospace", genre: "Structures" },
  { title: "Rocket Propulsion Elements", author: "Sutton & Biblarz", isbn: "978-0470080245", branch: "Aerospace", genre: "Propulsion" },
  { title: "Orbital Mechanics for Engineering Students", author: "Howard D. Curtis", isbn: "978-0080977478", branch: "Aerospace", genre: "Orbital Mechanics" },
  { title: "Aircraft Performance and Design", author: "John D. Anderson", isbn: "978-0070019713", branch: "Aerospace", genre: "Aircraft Design" },
  { title: "Gas Dynamics", author: "E. Rathakrishnan", isbn: "978-8120346604", branch: "Aerospace", genre: "Gas Dynamics" },
  { title: "Avionics Navigation Systems", author: "Myron Kayton", isbn: "978-0471547952", branch: "Aerospace", genre: "Avionics" },

  // ── BIOTECHNOLOGY (BT) ───────────────────────────────────────────────────
  { title: "Molecular Biology of the Cell", author: "Alberts et al.", isbn: "978-0393884821", branch: "Biotech", genre: "Molecular Biology" },
  { title: "Biochemistry", author: "Lehninger, Nelson & Cox", isbn: "978-1319114657", branch: "Biotech", genre: "Biochemistry" },
  { title: "Microbiology", author: "Prescott, Harley & Klein", isbn: "978-0073375298", branch: "Biotech", genre: "Microbiology" },
  { title: "Principles of Genetics", author: "Snustad & Simmons", isbn: "978-0470903599", branch: "Biotech", genre: "Genetics" },
  { title: "Bioprocess Engineering", author: "Shuler & Kargi", isbn: "978-0130819086", branch: "Biotech", genre: "Bioprocess" },
  { title: "Bioinformatics", author: "David W. Mount", isbn: "978-0879697129", branch: "Biotech", genre: "Bioinformatics" },
  { title: "Immunology", author: "Kuby", isbn: "978-1464189784", branch: "Biotech", genre: "Immunology" },
  { title: "Genetic Engineering", author: "S.B. Primrose", isbn: "978-1405135443", branch: "Biotech", genre: "Genetic Engg" },
];

const BRANCH_COLORS = {
  Common:   "linear-gradient(135deg,#6366f1,#8b5cf6)",
  CSE:      "linear-gradient(135deg,#0ea5e9,#6366f1)",
  IT:       "linear-gradient(135deg,#06b6d4,#0ea5e9)",
  ECE:      "linear-gradient(135deg,#f59e0b,#ef4444)",
  EE:       "linear-gradient(135deg,#f97316,#f59e0b)",
  ME:       "linear-gradient(135deg,#10b981,#059669)",
  Civil:    "linear-gradient(135deg,#84cc16,#16a34a)",
  Chemical: "linear-gradient(135deg,#ec4899,#f43f5e)",
  ISE:      "linear-gradient(135deg,#a855f7,#6366f1)",
  Aerospace:"linear-gradient(135deg,#14b8a6,#0ea5e9)",
  Biotech:  "linear-gradient(135deg,#22c55e,#16a34a)",
};

export default function Library({ user }) {
  const [requests, setRequests] = useState([]);
  const [modal, setModal] = useState(null);
  const [tab, setTab] = useState("catalog");
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("all");
  const [genre, setGenre]   = useState("all");

  // Digital Library state
  const [running, setRunning]         = useState(false);
  const [elapsed, setElapsed]         = useState(0);      // seconds this session
  const [todayTotal, setTodayTotal]   = useState(0);      // seconds saved today
  const [leaderboard, setLeaderboard] = useState([]);
  const [subject, setSubject]         = useState("");
  const timerRef = useRef(null);
  const saveRef  = useRef(null);

  useEffect(() => {
    API.get("/library").then(r => setRequests(r.data)).catch(() => {});
    if (user.role === "student") {
      API.get("/study/me").then(r => setTodayTotal(r.data.seconds || 0)).catch(() => {});
    }
    API.get("/study/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {});
  }, []);

  // Timer tick
  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
      // Auto-save every 30 seconds
      saveRef.current = setInterval(() => saveTime(30), 30000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(saveRef.current);
    }
    return () => { clearInterval(timerRef.current); clearInterval(saveRef.current); };
  }, [running]);

  const saveTime = async (secs) => {
    if (secs <= 0) return;
    try {
      const res = await API.post("/study", { seconds: secs });
      setTodayTotal(res.data.seconds || 0);
      API.get("/study/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {});
    } catch {}
  };

  const startTimer  = () => { if (!running) setRunning(true); };
  const pauseTimer  = () => { setRunning(false); };
  const stopTimer   = async () => {
    setRunning(false);
    if (elapsed > 0) {
      await saveTime(elapsed);
      setElapsed(0);
    }
  };

  const fmt = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const medal = (i) => ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;

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

  const filtered = CATALOG.filter(b => {
    const q = search.toLowerCase();
    return (
      (branch === "all" || b.branch === branch) &&
      (genre  === "all" || b.genre  === genre)  &&
      (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    );
  });

  const statusBadge = (s) => ({ pending: "badge-warning", approved: "badge-info", returned: "badge-success", rejected: "badge-danger" }[s] || "badge-gray");
  const branches = ["all", ...Object.keys(BRANCH_COLORS)];
  const genres   = ["all", ...new Set(
    (branch === "all" ? CATALOG : CATALOG.filter(b => b.branch === branch)).map(b => b.genre)
  )];

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
          <button className={`tab ${tab === "digital" ? "active" : ""}`} onClick={() => setTab("digital")}>💻 Digital Library</button>
        </div>
      </div>

      {tab === "catalog" && (
        <>
          {/* Search */}
          <input placeholder="🔍 Search books or authors..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: "9px 14px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.875rem", marginBottom: 10 }} />

          {/* Branch filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
            {branches.map(b => (
              <button key={b} onClick={() => { setBranch(b); setGenre("all"); }}
                className={`tab ${branch === b ? "active" : ""}`}
                style={{ textTransform: "capitalize", fontSize: "0.78rem" }}>{b === "all" ? "All Branches" : b}</button>
            ))}
          </div>

          {/* Subject/genre filter */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {genres.map(g => (
              <button key={g} onClick={() => setGenre(g)}
                className={`tab ${genre === g ? "active" : ""}`}
                style={{ textTransform: "capitalize", fontSize: "0.75rem" }}>{g === "all" ? "All Subjects" : g}</button>
            ))}
          </div>

          <p style={{ fontSize: "0.78rem", color: "var(--text3)", marginBottom: 12 }}>
            Showing <strong>{filtered.length}</strong> of <strong>{CATALOG.length}</strong> books
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "var(--text3)" }}>No books found.</div>
            )}
            {filtered.map(book => {
              const requested = isRequested(book.isbn);
              const bg = BRANCH_COLORS[book.branch] || "linear-gradient(135deg,#6366f1,#8b5cf6)";
              return (
                <div key={book.isbn} className="card" style={{ display: "flex", gap: 14 }}>
                  <div style={{
                    width: 48, height: 64, borderRadius: 6, flexShrink: 0,
                    background: bg,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.4rem"
                  }}>📚</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: 2 }}>{book.title}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text3)" }}>{book.author}</p>
                    <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>ISBN: {book.isbn}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                      <span className="badge badge-purple" style={{ fontSize: "0.65rem" }}>{book.branch}</span>
                      <span className="badge" style={{ fontSize: "0.65rem", background: "var(--surface2)", color: "var(--text3)" }}>{book.genre}</span>
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

      {tab === "digital" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>

          {/* ── TIMER PANEL ── */}
          <div style={{ display: "grid", gap: 16 }}>

            {/* Info banner */}
            <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)", borderRadius: 12, padding: "10px 16px", fontSize: "0.8rem", color: "var(--text3)" }}>
              📚 Start the timer when you begin studying. Your time is saved and counted in today's leaderboard.
            </div>

            {/* Timer card */}
            <div className="card" style={{ textAlign: "center", padding: 32 }}>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Current Session</p>

              {/* Clock display */}
              <div style={{
                fontFamily: "JetBrains Mono, monospace", fontSize: "3.5rem", fontWeight: 800,
                color: running ? "#10b981" : "var(--text)",
                background: "var(--surface2)", borderRadius: 16, padding: "20px 32px",
                display: "inline-block", marginBottom: 20,
                boxShadow: running ? "0 0 30px rgba(16,185,129,0.2)" : "none",
                transition: "all 0.3s",
              }}>
                {fmt(elapsed)}
              </div>

              {/* Subject input */}
              {user.role === "student" && (
                <div style={{ marginBottom: 16 }}>
                  <input
                    placeholder="What are you studying? (optional)"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    disabled={running}
                    style={{ width: "100%", padding: "8px 14px", borderRadius: 8, border: "1px solid var(--border2)", fontSize: "0.85rem", background: "var(--bg2)", textAlign: "center" }}
                  />
                </div>
              )}

              {/* Controls */}
              {user.role === "student" ? (
                <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                  {!running ? (
                    <button className="btn btn-success" onClick={startTimer} style={{ padding: "10px 28px", fontSize: "1rem" }}>
                      ▶️ {elapsed > 0 ? "Resume" : "Start"}
                    </button>
                  ) : (
                    <button className="btn btn-outline" onClick={pauseTimer} style={{ padding: "10px 28px", fontSize: "1rem" }}>
                      ⏸️ Pause
                    </button>
                  )}
                  <button className="btn btn-danger" onClick={stopTimer} disabled={elapsed === 0} style={{ padding: "10px 28px", fontSize: "1rem" }}>
                    ⏹️ Stop & Save
                  </button>
                </div>
              ) : (
                <p style={{ color: "var(--text3)", fontSize: "0.85rem" }}>Login as student to use the timer</p>
              )}
            </div>

            {/* Today's total */}
            {user.role === "student" && (
              <div className="card" style={{ display: "flex", alignItems: "center", gap: 16, padding: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>
                  📚
                </div>
                <div>
                  <p style={{ fontSize: "0.75rem", color: "var(--text3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Today's Total Study Time</p>
                  <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "1.8rem", fontWeight: 800, color: "var(--primary-light)", lineHeight: 1.2 }}>
                    {fmt(todayTotal + elapsed)}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text3)", marginTop: 2 }}>Saved: {fmt(todayTotal)} + Current: {fmt(elapsed)}</p>
                </div>
              </div>
            )}
          </div>

          {/* ── LEADERBOARD ── */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>🏆 Today's Leaderboard</p>
              <span style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</span>
            </div>

            {leaderboard.length === 0 ? (
              <div className="empty"><div className="empty-icon">🏆</div><p>No study sessions today yet. Be the first!</p></div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {leaderboard.map((s, i) => {
                  const isMe = s.studentId === user._id || s.studentId === user.id;
                  const pct  = leaderboard[0]?.seconds ? Math.round((s.seconds / leaderboard[0].seconds) * 100) : 0;
                  return (
                    <div key={s._id} style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                      borderRadius: 12, border: `1px solid ${isMe ? "rgba(99,102,241,0.4)" : "var(--border)"}`,
                      background: isMe ? "rgba(99,102,241,0.06)" : "var(--surface2)",
                    }}>
                      {/* Rank */}
                      <span style={{ fontSize: i < 3 ? "1.4rem" : "0.85rem", fontWeight: 700, minWidth: 32, textAlign: "center", color: "var(--text3)" }}>
                        {medal(i)}
                      </span>

                      {/* Avatar */}
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: i === 0 ? "linear-gradient(135deg, #f59e0b, #ef4444)"
                                  : i === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)"
                                  : i === 2 ? "linear-gradient(135deg, #d97706, #b45309)"
                                  : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontWeight: 700, fontSize: "0.8rem",
                      }}>
                        {s.studentName?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                      </div>

                      {/* Name + bar */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontWeight: isMe ? 700 : 600, fontSize: "0.85rem", color: isMe ? "var(--primary-light)" : "var(--text)" }}>
                            {s.studentName} {isMe ? "(You)" : ""}
                          </span>
                          <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "0.82rem", fontWeight: 700, color: "var(--text)" }}>
                            {fmt(s.seconds)}
                          </span>
                        </div>
                        <div style={{ height: 6, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 999, width: `${pct}%`,
                            background: i === 0 ? "#f59e0b" : i === 1 ? "#9ca3af" : i === 2 ? "#d97706" : "#6366f1",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button className="btn btn-outline btn-sm" style={{ marginTop: 14, width: "100%" }}
              onClick={() => API.get("/study/leaderboard").then(r => setLeaderboard(r.data)).catch(() => {})}>
              🔄 Refresh Leaderboard
            </button>
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
