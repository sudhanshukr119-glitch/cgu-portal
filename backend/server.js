const express    = require("express");
const cors       = require("cors");
const http       = require("http");
const helmet     = require("helmet");
const rateLimit  = require("express-rate-limit");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");

const app    = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = [
  ...(process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean),
  "http://localhost:3000",
  /https:\/\/.*\.vercel\.app$/,
];

const isOriginAllowed = (origin) =>
  !origin || ALLOWED_ORIGINS.some(o => o instanceof RegExp ? o.test(origin) : o === origin);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => cb(isOriginAllowed(origin) ? null : new Error("Not allowed by CORS"), isOriginAllowed(origin)),
    methods: ["GET","POST","PUT","DELETE"],
    credentials: true,
  }
});

// Security headers
app.use(helmet());

// CORS — restrict to known origins
app.use(cors({
  origin: (origin, cb) => cb(isOriginAllowed(origin) ? null : new Error("Not allowed by CORS"), isOriginAllowed(origin)),
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Global rate limiter — 200 req / 15 min per IP
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

// Stricter limiter for auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many attempts, please try again later" } });

// Body size limit
app.use(express.json({ limit: "10mb" }));

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => { req.io = io; next(); });

connectDB();

io.on("connection", socket => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("join_mp", (listingId) => socket.join(`mp_${listingId}`));
  socket.on("disconnect", () => console.log(`Socket disconnected: ${socket.id}`));
});

app.use("/api/auth",          authLimiter, require("./routes/authRoutes"));
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/assignments",   require("./routes/assignmentRoutes"));
app.use("/api/submissions",   require("./routes/submissionRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/fees",          require("./routes/feeRoutes"));
app.use("/api/payment",       require("./routes/paymentRoutes"));
app.use("/api/hostel",        require("./routes/hostelRoutes"));
app.use("/api/food",          require("./routes/foodRoutes"));
app.use("/api/menu",          require("./routes/menuRoutes"));
app.use("/api/dispensary",    require("./routes/dispensaryRoutes"));
app.use("/api/tech",          require("./routes/techRoutes"));
app.use("/api/attendance",    require("./routes/attendanceRoutes"));
app.use("/api/library",       require("./routes/libraryRoutes"));
app.use("/api/study",         require("./routes/studyRoutes"));
app.use("/api/events",        require("./routes/eventRoutes"));
app.use("/api/lostfound",     require("./routes/lostFoundRoutes"));
app.use("/api/marketplace",   require("./routes/marketplaceRoutes"));
app.use("/api/lms",          require("./routes/lmsRoutes"));
app.use("/api/chat",          require("./routes/chatRoutes"));
app.use("/api/leaves",        require("./routes/leaveRoutes"));
app.use("/api/results",       require("./routes/resultRoutes"));
app.use("/api/chatbot",       require("./routes/chatbotRoutes"));
app.use("/api/ai-logs",       require("./routes/aiLogRoutes"));

app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal server error" });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CGUCampus-One Server running on port ${PORT}`));
