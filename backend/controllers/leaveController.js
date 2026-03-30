const LeaveRequest = require("../models/LeaveRequest");
const ActivityLog = require("../models/ActivityLog");

exports.getLeaves = async (req, res) => {
  try {
    const filter = {};
    // Students only see their own
    if (req.user.role === "student") filter.student = req.user._id;
    // Teachers/admin see all or filter by status
    if (req.query.status) filter.status = req.query.status;
    if (req.query.class) filter.class = req.query.class;

    const leaves = await LeaveRequest.find(filter).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const { type, reason, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);

    if (start < today)
      return res.status(400).json({ message: "Start date cannot be in the past" });
    if (end < start)
      return res.status(400).json({ message: "End date cannot be before start date" });

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const leave = await LeaveRequest.create({
      student: req.user._id,
      studentName: req.user.name,
      studentRoll: req.user.rollNo,
      class: req.user.class,
      type, reason, startDate: start, endDate: end, days,
    });
    res.status(201).json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reviewLeave = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!["approved", "rejected"].includes(status))
      return res.status(400).json({ message: "Status must be approved or rejected" });

    const leave = await LeaveRequest.findByIdAndUpdate(
      req.params.id,
      {
        status,
        reviewNote,
        reviewedBy: req.user._id,
        reviewerName: req.user.name,
        reviewedAt: new Date(),
      },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: "Leave request not found" });

    await ActivityLog.create({
      user: req.user._id, userName: req.user.name, userRole: req.user.role,
      action: `LEAVE_${status.toUpperCase()}`, module: "leaves",
      details: `${status} leave for ${leave.studentName}`
    });

    res.json(leave);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
