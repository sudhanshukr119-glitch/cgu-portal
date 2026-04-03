const LMSCourse     = require("../models/LMSCourse");
const LMSLesson     = require("../models/LMSLesson");
const LMSTest       = require("../models/LMSTest");
const LMSAssignment = require("../models/LMSAssignment");
const LMSProgress   = require("../models/LMSProgress");

/* ─────────────────────────── COURSES ─────────────────────────── */

exports.getCourses = async (req, res) => {
  try {
    const filter = {};
    // Students only see published courses matching their dept/semester
    if (req.user.role === "student") {
      filter.isPublished = true;
      if (req.user.department) filter.$or = [{ department: req.user.department }, { department: "" }];
      if (req.user.semester)   filter.$and = [
        { $or: [{ semester: req.user.semester }, { semester: 0 }] }
      ];
    }
    // Teachers see only their own courses
    if (req.user.role === "teacher") filter.teacher = req.user._id;

    const courses = await LMSCourse.find(filter).sort({ createdAt: -1 });

    // Attach counts
    const withCounts = await Promise.all(courses.map(async (c) => {
      const [lessonCount, testCount, assignmentCount] = await Promise.all([
        LMSLesson.countDocuments({ course: c._id, isPublished: true }),
        LMSTest.countDocuments({ course: c._id, isPublished: true }),
        LMSAssignment.countDocuments({ course: c._id, isPublished: true }),
      ]);
      return { ...c.toObject(), lessonCount, testCount, assignmentCount };
    }));

    res.json(withCounts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getCourse = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (req.user.role === "student" && !course.isPublished)
      return res.status(403).json({ message: "Course not available" });

    const [lessons, tests, assignments] = await Promise.all([
      LMSLesson.find({ course: course._id, ...(req.user.role === "student" ? { isPublished: true } : {}) }).sort({ order: 1 }),
      LMSTest.find({ course: course._id, ...(req.user.role === "student" ? { isPublished: true } : {}) }).sort({ order: 1 }).select("-questions.correctIndex -attempts"),
      LMSAssignment.find({ course: course._id, ...(req.user.role === "student" ? { isPublished: true } : {}) }).sort({ order: 1 }).select("-submissions"),
    ]);

    // Student progress
    let progress = null;
    if (req.user.role === "student") {
      progress = await LMSProgress.findOne({ student: req.user._id, course: course._id });
      await LMSProgress.findOneAndUpdate(
        { student: req.user._id, course: course._id },
        { lastAccessed: new Date() },
        { upsert: true }
      );
    }

    res.json({ course, lessons, tests, assignments, progress });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, subject, department, semester, thumbnail, tags } = req.body;
    if (!title?.trim() || !subject?.trim())
      return res.status(400).json({ message: "Title and subject are required" });
    const course = await LMSCourse.create({
      title, description, subject, department, semester: semester || 0,
      thumbnail, tags: tags || [],
      teacher: req.user._id, teacherName: req.user.name,
    });
    res.status(201).json(course);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    const updated = await LMSCourse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    // Cascade delete
    await Promise.all([
      LMSLesson.deleteMany({ course: course._id }),
      LMSTest.deleteMany({ course: course._id }),
      LMSAssignment.deleteMany({ course: course._id }),
      LMSProgress.deleteMany({ course: course._id }),
    ]);
    await course.deleteOne();
    res.json({ message: "Course and all content deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─────────────────────────── LESSONS ─────────────────────────── */

exports.createLesson = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });

    const { title, description, content, order, duration, attachments, videoUrl, isPublished } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

    const lesson = await LMSLesson.create({
      course: course._id, title, description, content,
      order: order || 0, duration, attachments: attachments || [],
      videoUrl, teacher: req.user._id, isPublished: isPublished || false,
    });
    res.status(201).json(lesson);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await LMSLesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    const course = await LMSCourse.findById(lesson.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    const updated = await LMSLesson.findByIdAndUpdate(req.params.lessonId, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await LMSLesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    const course = await LMSCourse.findById(lesson.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    await lesson.deleteOne();
    res.json({ message: "Lesson deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student marks lesson complete
exports.completeLesson = async (req, res) => {
  try {
    const lesson = await LMSLesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const totalLessons = await LMSLesson.countDocuments({ course: lesson.course, isPublished: true });

    const progress = await LMSProgress.findOneAndUpdate(
      { student: req.user._id, course: lesson.course },
      {
        $addToSet: { completedLessons: lesson._id },
        lastAccessed: new Date(),
      },
      { upsert: true, new: true }
    );

    progress.percentage = totalLessons > 0
      ? Math.round((progress.completedLessons.length / totalLessons) * 100)
      : 0;
    await progress.save();

    res.json(progress);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─────────────────────────── PRACTICE TESTS ─────────────────────────── */

exports.createTest = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });

    const { title, description, questions, duration, passMark, maxAttempts, isPublished, order } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });
    if (!questions?.length) return res.status(400).json({ message: "At least one question is required" });

    const test = await LMSTest.create({
      course: course._id, title, description,
      questions, duration: duration || 30,
      passMark: passMark || 50, maxAttempts: maxAttempts || 3,
      teacher: req.user._id, isPublished: isPublished || false,
      order: order || 0,
    });
    res.status(201).json(test);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateTest = async (req, res) => {
  try {
    const test = await LMSTest.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    const course = await LMSCourse.findById(test.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    const updated = await LMSTest.findByIdAndUpdate(req.params.testId, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteTest = async (req, res) => {
  try {
    const test = await LMSTest.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    const course = await LMSCourse.findById(test.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    await test.deleteOne();
    res.json({ message: "Test deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get test with correct answers hidden for students
exports.getTest = async (req, res) => {
  try {
    const test = await LMSTest.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: "Test not found" });
    if (req.user.role === "student" && !test.isPublished)
      return res.status(403).json({ message: "Test not available" });

    if (req.user.role === "student") {
      // Check attempt limit
      const myAttempts = test.attempts.filter(a => a.student.toString() === req.user._id.toString());
      if (myAttempts.length >= test.maxAttempts)
        return res.status(400).json({ message: "Maximum attempts reached", attempts: myAttempts });

      // Hide correct answers
      const safeTest = test.toObject();
      safeTest.questions = safeTest.questions.map(({ correctIndex, explanation, ...q }) => q);
      safeTest.myAttempts = myAttempts;
      return res.json(safeTest);
    }

    res.json(test);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student submits test answers
exports.submitTest = async (req, res) => {
  try {
    const test = await LMSTest.findById(req.params.testId);
    if (!test || !test.isPublished) return res.status(404).json({ message: "Test not found" });

    const myAttempts = test.attempts.filter(a => a.student.toString() === req.user._id.toString());
    if (myAttempts.length >= test.maxAttempts)
      return res.status(400).json({ message: "Maximum attempts reached" });

    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ message: "Answers array required" });

    let score = 0;
    const results = test.questions.map((q, i) => {
      const correct = answers[i] === q.correctIndex;
      if (correct) score++;
      return { question: q.question, selected: answers[i], correct, correctIndex: q.correctIndex, explanation: q.explanation };
    });

    const total      = test.questions.length;
    const percentage = Math.round((score / total) * 100);
    const passed     = percentage >= test.passMark;

    test.attempts.push({ student: req.user._id, answers, score, total, percentage });
    await test.save();

    res.json({ score, total, percentage, passed, passMark: test.passMark, results });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Teacher views all attempts for a test
exports.getTestAttempts = async (req, res) => {
  try {
    const test = await LMSTest.findById(req.params.testId).populate("attempts.student", "name rollNo class");
    if (!test) return res.status(404).json({ message: "Test not found" });
    res.json(test.attempts);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─────────────────────────── ASSIGNMENTS ─────────────────────────── */

exports.createAssignment = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });

    const { title, description, instructions, dueDate, maxMarks, attachments, isPublished, order } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: "Title is required" });

    const assignment = await LMSAssignment.create({
      course: course._id, title, description, instructions,
      dueDate, maxMarks: maxMarks || 100,
      attachments: attachments || [],
      teacher: req.user._id, isPublished: isPublished || false,
      order: order || 0,
    });
    res.status(201).json(assignment);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const course = await LMSCourse.findById(assignment.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    const updated = await LMSAssignment.findByIdAndUpdate(req.params.assignmentId, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(400).json({ message: err.message }); }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const course = await LMSCourse.findById(assignment.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });
    await assignment.deleteOne();
    res.json({ message: "Assignment deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Get assignment — students see their own submission only
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    if (req.user.role === "student" && !assignment.isPublished)
      return res.status(403).json({ message: "Assignment not available" });

    if (req.user.role === "student") {
      const obj = assignment.toObject();
      obj.mySubmission = obj.submissions.find(s => s.student.toString() === req.user._id.toString()) || null;
      delete obj.submissions;
      return res.json(obj);
    }

    const populated = await LMSAssignment.findById(req.params.assignmentId)
      .populate("submissions.student", "name rollNo class");
    res.json(populated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Student submits assignment
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.assignmentId);
    if (!assignment || !assignment.isPublished)
      return res.status(404).json({ message: "Assignment not found" });

    const already = assignment.submissions.find(s => s.student.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: "Already submitted. Contact teacher to resubmit." });

    const { answer, fileUrl, fileName } = req.body;
    assignment.submissions.push({
      student: req.user._id, studentName: req.user.name,
      answer: answer || "", fileUrl: fileUrl || "", fileName: fileName || "",
    });
    await assignment.save();
    res.status(201).json({ message: "Submitted successfully" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Teacher grades a submission
exports.gradeSubmission = async (req, res) => {
  try {
    const assignment = await LMSAssignment.findById(req.params.assignmentId);
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    const course = await LMSCourse.findById(assignment.course);
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });

    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    const { grade, feedback } = req.body;
    if (grade === undefined || grade === null) return res.status(400).json({ message: "Grade is required" });
    if (grade > assignment.maxMarks) return res.status(400).json({ message: `Grade cannot exceed ${assignment.maxMarks}` });

    submission.grade    = grade;
    submission.feedback = feedback || "";
    submission.graded   = true;
    await assignment.save();

    res.json({ message: "Graded successfully", submission });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─────────────────────────── PROGRESS ─────────────────────────── */

exports.getMyProgress = async (req, res) => {
  try {
    const progress = await LMSProgress.find({ student: req.user._id })
      .populate("course", "title subject thumbnail teacherName");
    res.json(progress);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// Teacher dashboard — all students' progress for a course
exports.getCourseProgress = async (req, res) => {
  try {
    const course = await LMSCourse.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.teacher.toString() !== req.user._id.toString() && req.user.role !== "admin")
      return res.status(403).json({ message: "Not authorised" });

    const progress = await LMSProgress.find({ course: req.params.courseId })
      .populate("student", "name rollNo class department");
    res.json(progress);
  } catch (err) { res.status(500).json({ message: err.message }); }
};
