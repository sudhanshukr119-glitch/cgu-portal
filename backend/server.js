const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

const app = express();

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());

connectDB();

app.use("/api/auth",          require("./routes/authRoutes"));
app.use("/api/users",         require("./routes/userRoutes"));
app.use("/api/assignments",   require("./routes/assignmentRoutes"));
app.use("/api/submissions",   require("./routes/submissionRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/fees",          require("./routes/feeRoutes"));
app.use("/api/hostel",        require("./routes/hostelRoutes"));
app.use("/api/food",          require("./routes/foodRoutes"));
app.use("/api/menu",          require("./routes/menuRoutes"));
app.use("/api/dispensary",    require("./routes/dispensaryRoutes"));
app.use("/api/tech",          require("./routes/techRoutes"));
app.use("/api/attendance",    require("./routes/attendanceRoutes"));
app.use("/api/library",       require("./routes/libraryRoutes"));
app.use("/api/events",        require("./routes/eventRoutes"));
app.use("/api/lostfound",     require("./routes/lostFoundRoutes"));
app.use("/api/chat",          require("./routes/chatRoutes"));
app.use("/api/leaves",        require("./routes/leaveRoutes"));
app.use("/api/results",       require("./routes/resultRoutes"));

// Health check
app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Campus ERP Server running on port ${PORT}`));
