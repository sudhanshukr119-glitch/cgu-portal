const Hostel = require("../models/Hostel");
const Notification = require("../models/Notification");

const feedbackLabels = { completed: "✅ Completed", "in-progress": "🔄 Still In Progress", "not-done": "❌ Not Done" };

const notifyAdmin = (title, message, type = "info", refId = "") =>
  Notification.create({ title, message, type, targetRole: "admin", module: "hostel", refId, postedBy: "system", date: new Date() }).catch(() => {});

exports.getRequests = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user._id } : {};
    res.json(await Hostel.find(filter).sort({ createdAt: -1 }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createRequest = async (req, res) => {
  try {
    res.json(await Hostel.create({ ...req.body, studentId: req.user._id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateRequest = async (req, res) => {
  try {
    const request = await Hostel.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Student can only confirm resolution OR add a progress note on their own request
    if (req.user.role === "student") {
    if (request.studentId.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not your request" });

      // Student updating status on their own request
      if (req.body.status) {
        const { status, studentFeedback } = req.body;
        const allowed = ["open", "in-progress", "resolved"];
        if (!allowed.includes(status))
          return res.status(403).json({ message: "Invalid status" });

        const updates = { status };
        // Student marking completed → auto-resolve with confirmed feedback
        if (status === "resolved") {
          updates.studentConfirmed = true;
          updates.studentFeedback  = studentFeedback || "completed";
          updates.confirmedAt      = new Date();
          updates.resolvedAt       = new Date();
        }

        const updated = await Hostel.findByIdAndUpdate(req.params.id, updates, { new: true });
        const label = status === "resolved" ? "✅ Completed" : status === "in-progress" ? "🔄 In Progress" : "🔴 Open";
        notifyAdmin(
          `🏠 Status Update — Room ${request.roomNo}, ${request.block}`,
          `${request.studentName} marked the "${request.issueType}" issue as: ${label}`,
          status === "resolved" ? "success" : "info", req.params.id
        );
        return res.json(updated);
      }

      // Adding a progress update note
      if (req.body.progressNote) {
        const progress = Math.min(100, Math.max(0, Number(req.body.progress) || 0));
        const updated = await Hostel.findByIdAndUpdate(
          req.params.id,
          {
            $push: { progressUpdates: { note: req.body.progressNote, progress, addedAt: new Date() } },
            studentProgress: progress,
          },
          { new: true }
        );
        notifyAdmin(
          `📊 Progress Update — Room ${request.roomNo}, ${request.block}`,
          `${request.studentName} reported ${progress}% progress on "${request.issueType}" issue: "${req.body.progressNote}"`,
          "info", req.params.id
        );
        return res.json(updated);
      }

      // Submitting feedback after admin resolves
      const { studentFeedback } = req.body;
      if (!["completed", "in-progress", "not-done"].includes(studentFeedback))
        return res.status(403).json({ message: "Invalid feedback value" });
      const updated = await Hostel.findByIdAndUpdate(
        req.params.id,
        { studentConfirmed: true, studentFeedback, confirmedAt: new Date() },
        { new: true }
      );
      notifyAdmin(
        `🏠 Hostel Feedback — Room ${request.roomNo}, ${request.block}`,
        `${request.studentName} marked the "${request.issueType}" issue as: ${feedbackLabels[studentFeedback] || studentFeedback}`,
        studentFeedback === "completed" ? "success" : studentFeedback === "not-done" ? "urgent" : "warning",
        req.params.id
      );
      return res.json(updated);
    }

    // Admin / teacher: full status control
    const updates = { ...req.body };
    if (updates.status === "resolved") updates.resolvedAt = new Date();
    res.json(await Hostel.findByIdAndUpdate(req.params.id, updates, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
