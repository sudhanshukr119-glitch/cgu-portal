const express = require("express");
const cors    = require("cors");
const http    = require("http");
const { Server } = require("socket.io");
require("dotenv").config();
const connectDB = require("./config/db");

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*", methods: ["GET","POST","PUT","DELETE"] }
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

// Attach io to every request so controllers can emit events
app.use((req, _res, next) => { req.io = io; next(); });

connectDB();

io.on("connection", socket => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on("disconnect", () => console.log(`Socket disconnected: ${socket.id}`));
});

app.use("/api/auth",          require("./routes/authRoutes"));
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
app.use("/api/chat",          require("./routes/chatRoutes"));
app.use("/api/leaves",        require("./routes/leaveRoutes"));
app.use("/api/results",       require("./routes/resultRoutes"));

app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 CGUCampus-One Server running on port ${PORT}`));
