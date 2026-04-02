const Fee = require("../models/Fee");

// Default fee structure seeded for new students
const DEFAULT_FEES = (studentId, studentName, semester) => {
  const now   = new Date();
  const sem   = semester || 1;
  const due30 = new Date(now); due30.setDate(due30.getDate() + 30);
  const due60 = new Date(now); due60.setDate(due60.getDate() + 60);
  const overD = new Date(now); overD.setDate(overD.getDate() - 10); // already overdue

  return [
    { studentId, studentName, type: "tuition",   amount: 85000, semester: `Sem ${sem}`,   status: "pending", dueDate: due30 },
    { studentId, studentName, type: "hostel",    amount: 45000, semester: `Sem ${sem}`,   status: "pending", dueDate: due60 },
    { studentId, studentName, type: "exam",      amount: 8000,  semester: `Sem ${sem}`,   status: "pending", dueDate: due30 },
    { studentId, studentName, type: "library",   amount: 3000,  semester: `Annual`,       status: "paid",    dueDate: overD, paidDate: new Date(now.getFullYear(), 6, 1) },
    { studentId, studentName, type: "transport", amount: 12000, semester: `Sem ${sem}`,   status: "overdue", dueDate: overD },
    { studentId, studentName, type: "other",     amount: 5000,  semester: `Sem ${sem}`,   status: "pending", dueDate: due60 },
  ];
};

exports.getFees = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    let fees = await Fee.find(filter)
      .populate("studentId", "name rollNo class department semester")
      .sort({ dueDate: 1 });

    // Auto-seed default fees for student if none exist
    if (req.user.role === "student" && fees.length === 0) {
      const seeded = await Fee.insertMany(
        DEFAULT_FEES(req.user.id, req.user.name, req.user.semester)
      );
      fees = await Fee.find({ studentId: req.user.id })
        .populate("studentId", "name rollNo class department semester")
        .sort({ dueDate: 1 });
    }

    // Auto-mark overdue
    const today = new Date();
    const overdueIds = fees
      .filter(f => f.status === "pending" && f.dueDate && new Date(f.dueDate) < today)
      .map(f => f._id);

    if (overdueIds.length > 0) {
      await Fee.updateMany({ _id: { $in: overdueIds } }, { status: "overdue" });
      fees = fees.map(f =>
        overdueIds.some(id => id.equals(f._id))
          ? { ...f.toObject(), status: "overdue" }
          : f
      );
    }

    // Enrich with student name/rollNo/class from populated field
    const enriched = fees.map(f => {
      const obj = f.toObject ? f.toObject() : f;
      if (obj.studentId && typeof obj.studentId === "object") {
        obj.studentName = obj.studentName || obj.studentId.name;
        obj.rollNo      = obj.rollNo      || obj.studentId.rollNo;
        obj.class       = obj.class       || obj.studentId.class;
      }
      return obj;
    });

    res.json(enriched);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Summary totals for dashboard stat cards
exports.getFeeSummary = async (req, res) => {
  try {
    const filter = req.user.role === "student" ? { studentId: req.user.id } : {};
    const fees = await Fee.find(filter);

    const total   = fees.reduce((s, f) => s + (f.amount || 0), 0);
    const paid    = fees.filter(f => f.status === "paid").reduce((s, f) => s + (f.amount || 0), 0);
    const pending = fees.filter(f => f.status === "pending").reduce((s, f) => s + (f.amount || 0), 0);
    const overdue = fees.filter(f => f.status === "overdue").reduce((s, f) => s + (f.amount || 0), 0);

    res.json({ total, paid, pending, overdue, count: fees.length });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createFee = async (req, res) => {
  try {
    res.json(await Fee.create(req.body));
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.updateFee = async (req, res) => {
  try {
    res.json(await Fee.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(500).json({ message: err.message }); }
};
