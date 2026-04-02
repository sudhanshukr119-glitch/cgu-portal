const Result = require("../models/Result");
const User = require("../models/User");

exports.getResults = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === "student") {
      filter.student = req.user._id;
      filter.isPublished = true;
    } else {
      if (req.query.studentId) filter.student = req.query.studentId;
      if (req.query.class)     filter.class   = req.query.class;
      if (req.query.subject)   filter.subject = req.query.subject;
    }
    if (req.query.semester) filter.semester = Number(req.query.semester);
    if (req.query.examType) filter.examType = req.query.examType;

    const results = await Result.find(filter).sort({ semester: 1, createdAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createResult = async (req, res) => {
  try {
    const student = await User.findById(req.body.studentId);
    if (!student || student.role !== "student")
      return res.status(404).json({ message: "Student not found" });

    const result = await Result.create({
      ...req.body,
      student: student._id,
      studentName: student.name,
      rollNo: student.rollNo,
      class: student.class,
      semester: student.semester,
      enteredBy: req.user._id,
      academicYear: new Date().getFullYear() + "-" + (new Date().getFullYear() + 1),
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!result) return res.status(404).json({ message: "Result not found" });
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.publishResults = async (req, res) => {
  try {
    const { resultIds } = req.body;
    await Result.updateMany(
      { _id: { $in: resultIds } },
      { isPublished: true, publishedAt: new Date() }
    );
    res.json({ message: `${resultIds.length} results published` });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Analytics: class performance summary
exports.getClassAnalytics = async (req, res) => {
  try {
    const { class: cls, subject, semester } = req.query;
    const filter = {};
    // admin/teacher can see all; filter by published only if no specific filters
    if (cls) filter.class = cls;
    if (subject) filter.subject = { $regex: subject, $options: "i" };
    if (semester) filter.semester = Number(semester);

    const results = await Result.find(filter);
    if (!results.length) return res.json({ avg: 0, highest: 0, lowest: 0, pass: 0, fail: 0, total: 0, distribution: {} });

    const marks = results.map(r => (r.marksObtained / r.totalMarks) * 100);
    const avg = (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(1);
    const highest = Math.max(...marks).toFixed(1);
    const lowest  = Math.min(...marks).toFixed(1);
    const pass = results.filter(r => r.grade !== "F").length;
    const fail = results.filter(r => r.grade === "F").length;
    const distribution = results.reduce((acc, r) => {
      acc[r.grade] = (acc[r.grade] || 0) + 1;
      return acc;
    }, {});

    res.json({ avg, highest, lowest, pass, fail, distribution, total: results.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
