# 🎓 CGU Portal — Viva Preparation Guide

---

## 1. PROJECT OVERVIEW

### What is CGU Portal?
CGU Portal is a **College ERP (Enterprise Resource Planning) system** built using the **MERN stack**.
It manages all college operations — students, faculty, attendance, fees, hostel, canteen, results, and more — through a single web application.

### What is MERN Stack?
| Letter | Technology | Role |
|--------|-----------|------|
| M | MongoDB | Database |
| E | Express.js | Backend Framework |
| R | React | Frontend Library |
| N | Node.js | Backend Runtime |

---

## 2. ARCHITECTURE

### MVC Pattern
The project follows **MVC (Model-View-Controller)** architecture:
- **Model** → Mongoose schemas (`User.js`, `Attendance.js`, `Result.js` etc.)
- **View** → React components (`Attendance.jsx`, `Hostel.jsx` etc.)
- **Controller** → Express controllers (`attendanceController.js` etc.)

### RESTful API
All backend routes follow REST conventions:
| HTTP Method | Action | Example |
|-------------|--------|---------|
| GET | Read | `GET /api/attendance` |
| POST | Create | `POST /api/attendance` |
| PUT | Update | `PUT /api/hostel/:id` |
| DELETE | Delete | `DELETE /api/menu/:id` |

### Folder Structure
```
cgu-portal/
├── backend/
│   ├── models/        → MongoDB schemas
│   ├── controllers/   → Business logic
│   ├── routes/        → API endpoints
│   ├── middleware/    → Auth, role checks
│   └── server.js      → Entry point
└── frontend/
    └── src/
        ├── pages/     → React page components
        ├── components/→ Reusable components
        └── api.js     → Axios configuration
```

---

## 3. FRONTEND — REACT

### What is React?
React is a **JavaScript library** for building user interfaces using reusable **components**.

### Key React Concepts Used

#### useState
Manages local state inside a component.
```js
const [records, setRecords] = useState([]);
// records = current value
// setRecords = function to update it
```

#### useEffect
Runs code when component loads (like fetching data from API).
```js
useEffect(() => {
  API.get("/attendance").then(r => setRecords(r.data));
}, []); // [] means run only once on mount
```

#### Props
Passing data from parent to child component.
```js
// Parent
<Attendance user={user} />

// Child receives it
function Attendance({ user }) { ... }
```

#### Component Lifecycle
1. **Mount** → component appears on screen → useEffect runs
2. **Update** → state changes → component re-renders
3. **Unmount** → component removed from screen

### Axios — API Communication
```js
// api.js — central configuration
const API = axios.create({ baseURL: "http://localhost:5000/api" });

// Interceptor — auto-attach JWT token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});
```

### Recharts — Data Visualization
Used for charts in Attendance, Results, Analytics:
- `BarChart` → subject-wise attendance, grade distribution
- `AreaChart` → SGPA trend, attendance trend
- `PieChart` → fee status distribution
- `ResponsiveContainer` → makes charts responsive

---

## 4. BACKEND — NODE.JS & EXPRESS

### What is Node.js?
Node.js is a **JavaScript runtime** that allows JavaScript to run on the server side (outside the browser). It uses an **event-driven, non-blocking I/O model** making it fast and efficient.

### What is Express.js?
Express is a **web framework** for Node.js that simplifies:
- Routing (mapping URLs to functions)
- Middleware (processing requests before they reach controllers)
- Error handling

### How a Request is Handled
```
Client Request
     ↓
CORS Middleware (allows cross-origin)
     ↓
express.json() (parses request body)
     ↓
Router (matches URL to handler)
     ↓
auth Middleware (verifies JWT)
     ↓
requireRole Middleware (checks role)
     ↓
Controller (business logic)
     ↓
MongoDB Query
     ↓
JSON Response sent back
```

### Middleware
Middleware is a function that runs **between** the request and the response.
```js
// Example: auth middleware
const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next(); // pass to next middleware/controller
};
```

---

## 5. DATABASE — MONGODB & MONGOOSE

### What is MongoDB?
MongoDB is a **NoSQL database** that stores data as **documents** (JSON-like format called BSON).
- No fixed table structure like SQL
- Each document can have different fields
- Data stored in **collections** (like tables in SQL)

### SQL vs MongoDB
| SQL | MongoDB |
|-----|---------|
| Table | Collection |
| Row | Document |
| Column | Field |
| JOIN | populate() |
| Schema fixed | Schema flexible |

### What is Mongoose?
Mongoose is an **ODM (Object Data Modeling)** library that:
- Defines structure (schema) for MongoDB documents
- Validates data before saving
- Provides methods like `.find()`, `.create()`, `.findByIdAndUpdate()`

### Mongoose Schema Example
```js
const attendanceSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  subject:   { type: String, required: true },
  status:    { type: String, enum: ["present","absent","late"], default: "present" },
  date:      { type: Date, default: Date.now },
}, { timestamps: true }); // adds createdAt and updatedAt automatically
```

### Pre-Save Hook
Runs automatically before a document is saved:
```js
// Auto-calculate grade before saving result
resultSchema.pre("save", function () {
  const pct = (this.marksObtained / this.totalMarks) * 100;
  if (pct >= 90) this.grade = "A+";
  else if (pct >= 80) this.grade = "A";
  // ...
});
```

### Collections in CGU Portal (19 total)
Users, Attendance, SelfAttendance, Results, Fees, Hostel, Food, MenuItem,
LeaveRequest, Library, Assignments, Submissions, Notifications, Events,
LostFound, Dispensary, TechSupport, Chat, ActivityLog

---

## 6. AUTHENTICATION — JWT

### What is JWT?
JWT (JSON Web Token) is a **token-based authentication** system.
After login, the server gives the user a signed token. The user sends this token with every request to prove their identity.

### JWT Structure
```
header.payload.signature
eyJhbGci...  .eyJpZCI6...  .xK9sd2lP...
```
- **Header** → algorithm used (HS256)
- **Payload** → user data (id, role)
- **Signature** → secret key verification (tamper-proof)

### JWT Flow in CGU Portal
```
1. User logs in → POST /api/auth/login
2. Backend verifies password with bcrypt
3. Backend creates token → jwt.sign({ id, role }, SECRET, { expiresIn: "7d" })
4. Token sent to frontend
5. Frontend stores in localStorage
6. Every request → token in Authorization header
7. Backend verifies → jwt.verify(token, SECRET)
8. User identity confirmed → request processed
```

### Why JWT over Sessions?
- **Stateless** → server doesn't store session data
- **Scalable** → works across multiple servers
- **Self-contained** → token carries user info

---

## 7. SECURITY — BCRYPT

### What is Bcrypt?
Bcrypt is a **password hashing library** that converts plain text passwords into an unreadable hash.

### How it Works
```js
// Hashing (on registration/creation)
const hashed = await bcrypt.hash("password123", 12);
// 12 = salt rounds (higher = more secure but slower)
// Stores: "$2b$12$xK9sd2lPqR..." in database

// Comparing (on login)
const isMatch = await bcrypt.compare("password123", hashedPassword);
// Returns true or false
```

### Why Hashing?
- Even if database is hacked, passwords cannot be read
- Same password hashed twice gives **different results** (due to salt)
- Cannot be reversed (one-way function)

---

## 8. RBAC — ROLE BASED ACCESS CONTROL

### What is RBAC?
RBAC means different users get different access based on their **role**.

### Three Roles in CGU Portal
| Role | Can Do |
|------|--------|
| Admin | Everything — manage users, fees, analytics |
| Teacher | Mark attendance, enter results, approve leaves |
| Student | View own data, apply leave, raise requests |

### How RBAC is Implemented — 3 Layers

#### Layer 1 — Route Level (Middleware)
```js
router.post("/attendance/bulk", auth, requireRole("teacher","admin"), bulkMark);
// Only teacher and admin can reach bulkMark controller
```

#### Layer 2 — Controller Level (Data Filtering)
```js
const filter = req.user.role === "student"
  ? { studentId: req.user.id }  // student sees only their data
  : {};                          // teacher/admin sees all
```

#### Layer 3 — Frontend Level (UI Hiding)
```js
// Nav items filtered by role
const NAV = NAV_ALL.filter(n => n.roles.includes(user.role));

// Conditional rendering
{user.role === "admin" && <button>Delete User</button>}
```

### requireRole Middleware
```js
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: "Access denied" });
  next();
};
```

### HTTP Status Codes for Auth
- **401 Unauthorized** → no token / invalid token
- **403 Forbidden** → valid token but wrong role

---

## 9. CORS

### What is CORS?
CORS (Cross-Origin Resource Sharing) is a **browser security mechanism** that blocks requests between different origins unless the server explicitly allows it.

### Why Needed in CGU Portal?
```
Frontend → http://localhost:3000
Backend  → http://localhost:5000
Different ports = Different origins = Browser blocks by default
```

### Solution in server.js
```js
app.use(cors({
  origin: "*",  // allow all origins (development)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

### Production Best Practice
```js
app.use(cors({ origin: "https://your-frontend.com" })); // specific origin only
```

---

## 10. KEY FEATURES — TECHNICAL EXPLANATION

### Bulk Attendance
- Frontend collects all student statuses in an array
- Single `POST /api/attendance/bulk` call with all records
- Backend uses `insertMany()` with `{ ordered: false }` — if one fails, rest still save
```js
await Attendance.insertMany(records, { ordered: false });
```

### Auto Grade Calculation
- Mongoose **pre-save hook** calculates grade automatically
- No manual grade entry needed
- Grade based on percentage: A+(90+), A(80+), B+(70+), B(60+), C+(50+), C(40+), F

### Self Attendance Tracker
- Completely **separate MongoDB collection** (SelfAttendance)
- Never mixes with official attendance
- Unique index prevents duplicate entries for same student+subject+date
```js
selfAttendanceSchema.index({ studentId: 1, subject: 1, date: 1 }, { unique: true });
```

### Hostel Feedback Loop
```
Admin marks request "Resolved"
     ↓
Student sees feedback buttons (Completed / In Progress / Not Done)
     ↓
Student selects feedback
     ↓
Backend saves studentFeedback + studentConfirmed
     ↓
Notification auto-created for admin
     ↓
Admin sees notification in Announcements
```

### Lost & Found Auto-Resolve
- When any item is resolved → `type` automatically flips to `"found"`
- `resolvedAt` timestamp recorded
```js
if (updates.status === "resolved") {
  updates.type = "found";
  updates.resolvedAt = new Date();
}
```

### Menu Management
- Menu stored in **MongoDB** (not hardcoded)
- Admin can add/edit/delete/toggle availability
- Auto-seeds default 11 items on first load if DB is empty
- Students only see `available: true` items

### WhatsApp Integration
- Uses `wa.me/<number>` deep link — no API needed
- Opens WhatsApp directly with faculty number pre-filled
- Zero cost, zero setup
```js
<a href={`https://wa.me/${phone}`} target="_blank">WhatsApp</a>
```

### Leave Date Validation
- Frontend: `min={today}` on date input blocks past dates in browser
- Backend: validates `start < today` → returns 400 error
- Two-layer protection — frontend for UX, backend for security

---

## 11. FRONTEND-BACKEND CONNECTION

### Complete Flow
```
React Component
     ↓ API.get("/attendance")
Axios (adds JWT token to header)
     ↓ HTTP Request to localhost:5000/api/attendance
Express Router
     ↓ matches GET /attendance
auth Middleware (verifies JWT)
     ↓
requireRole Middleware (checks role)
     ↓
Controller (queries MongoDB)
     ↓
Mongoose (returns documents)
     ↓
JSON Response
     ↓
Axios receives response
     ↓
React setState → UI updates
```

### api.js — The Bridge
```js
const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});
```

---

## 12. COMPLETE TECH STACK

| Category | Technology | Purpose |
|----------|-----------|---------|
| Frontend | React 18 | UI components |
| HTTP Client | Axios | API calls |
| Charts | Recharts | Data visualization |
| Animations | Framer Motion | UI animations |
| CSS | Tailwind + Custom CSS | Styling + Dark mode |
| Backend | Node.js | Server runtime |
| Framework | Express.js | Routing + Middleware |
| Database | MongoDB | Data storage |
| ODM | Mongoose | Schema + Queries |
| Auth | JWT | Token authentication |
| Security | Bcrypt | Password hashing |
| Cross Origin | CORS | Frontend-backend communication |
| Config | dotenv | Environment variables |
| Dev Tool | nodemon | Auto-restart server |
| Version Control | Git + GitHub | Code management |
| Architecture | MVC + REST | Project structure |

---

## 13. POSSIBLE VIVA QUESTIONS & ANSWERS

**Q: What is the difference between SQL and NoSQL?**
A: SQL stores data in fixed tables with rows and columns. NoSQL (like MongoDB) stores data as flexible JSON documents. SQL uses JOIN for relations, MongoDB uses populate(). SQL has fixed schema, MongoDB has flexible schema.

**Q: What is middleware in Express?**
A: Middleware is a function that runs between the request and response. It has access to `req`, `res`, and `next`. Examples: auth (verify token), cors (allow origins), express.json() (parse body).

**Q: What is the difference between authentication and authorization?**
A: Authentication = verifying WHO you are (login with JWT). Authorization = verifying WHAT you can do (RBAC with requireRole).

**Q: Why use MongoDB instead of MySQL for this project?**
A: College data is flexible — students have different fields than teachers. MongoDB's flexible schema handles this better. Also, JSON format matches JavaScript naturally in a MERN stack.

**Q: What happens if JWT token expires?**
A: The `jwt.verify()` throws a `TokenExpiredError`. The auth middleware catches it and returns 401. The user must log in again to get a new token.

**Q: What is a pre-save hook in Mongoose?**
A: It's a function that runs automatically before a document is saved to MongoDB. In CGU Portal, it auto-calculates grades from marks percentage and auto-assigns permissions based on user role.

**Q: What is the purpose of salt in bcrypt?**
A: Salt is a random string added to the password before hashing. It ensures the same password hashed twice gives different results, preventing rainbow table attacks.

**Q: What is CORS and why is it needed?**
A: CORS is a browser security rule that blocks requests between different origins. Since frontend runs on port 3000 and backend on port 5000, CORS must be enabled on the backend to allow communication.

**Q: What is the difference between GET and POST?**
A: GET retrieves data (no body, visible in URL). POST sends data to create something (has request body, not visible in URL). GET is idempotent (same result every time), POST is not.

**Q: How does role-based access work in this project?**
A: Three layers — Route level (requireRole middleware blocks wrong roles), Controller level (filters data by role), Frontend level (hides UI elements). 401 for no token, 403 for wrong role.

**Q: What is insertMany and why use it for bulk attendance?**
A: `insertMany()` inserts multiple documents in a single database operation. It's faster than individual inserts. With `{ ordered: false }`, if one record fails, the rest still get saved.

**Q: What is localStorage and why store JWT there?**
A: localStorage is browser storage that persists even after page refresh. JWT is stored there so the user stays logged in. It's sent with every API request via the Axios interceptor.

**Q: What is a RESTful API?**
A: REST (Representational State Transfer) is an architectural style for APIs. It uses HTTP methods (GET, POST, PUT, DELETE) to perform CRUD operations on resources identified by URLs.

**Q: What is the purpose of dotenv?**
A: dotenv loads environment variables from a `.env` file into `process.env`. It keeps sensitive data like JWT_SECRET, MONGO_URI, and API keys out of the source code.

**Q: What is nodemon?**
A: nodemon is a development tool that automatically restarts the Node.js server whenever a file changes. Without it, you'd have to manually stop and restart the server after every code change.

**Q: How is dark mode implemented?**
A: Using CSS custom properties (variables) like `var(--bg)`, `var(--text)`. A ThemeToggle component switches a class on the root element, which changes all CSS variable values at once.

---

## 14. QUICK REVISION — ONE LINERS

- **React** → UI library using reusable components with state management
- **Node.js** → JavaScript runtime for server-side programming
- **Express.js** → Web framework for routing and middleware in Node.js
- **MongoDB** → NoSQL database storing flexible JSON documents
- **Mongoose** → ODM library defining schemas and queries for MongoDB
- **JWT** → Token given after login, verified on every protected request
- **Bcrypt** → One-way password hashing with salt for security
- **CORS** → Allows frontend (3000) to communicate with backend (5000)
- **Axios** → HTTP client that makes API calls from React to Express
- **RBAC** → Different roles get different access — admin, teacher, student
- **MVC** → Separates data (Model), UI (View), and logic (Controller)
- **REST** → API design using HTTP methods for CRUD operations
- **Pre-save hook** → Mongoose function that runs before saving to DB
- **Middleware** → Function between request and response in Express
- **insertMany** → Saves multiple MongoDB documents in one operation
- **useEffect** → React hook that runs code when component mounts
- **useState** → React hook that manages local component state
- **dotenv** → Loads secret config from .env file into process.env
- **nodemon** → Auto-restarts server on file changes during development
- **Recharts** → React library for drawing charts and graphs

---

*Made for CGU Portal Viva Preparation — MERN Stack College ERP System*
