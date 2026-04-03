const router  = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const c = require("../controllers/lmsController");

const teacher = requireRole("teacher", "admin");
const student = requireRole("student", "teacher", "admin");

/* ── COURSES ── */
router.get   ("/courses",                          auth, student, c.getCourses);
router.post  ("/courses",                          auth, teacher, c.createCourse);
router.get   ("/courses/:id",                      auth, student, c.getCourse);
router.put   ("/courses/:id",                      auth, teacher, c.updateCourse);
router.delete("/courses/:id",                      auth, teacher, c.deleteCourse);

/* ── LESSONS ── */
router.post  ("/courses/:courseId/lessons",        auth, teacher, c.createLesson);
router.put   ("/lessons/:lessonId",                auth, teacher, c.updateLesson);
router.delete("/lessons/:lessonId",                auth, teacher, c.deleteLesson);
router.post  ("/lessons/:lessonId/complete",       auth, requireRole("student"), c.completeLesson);

/* ── PRACTICE TESTS ── */
router.post  ("/courses/:courseId/tests",          auth, teacher, c.createTest);
router.get   ("/tests/:testId",                    auth, student, c.getTest);
router.put   ("/tests/:testId",                    auth, teacher, c.updateTest);
router.delete("/tests/:testId",                    auth, teacher, c.deleteTest);
router.post  ("/tests/:testId/submit",             auth, requireRole("student"), c.submitTest);
router.get   ("/tests/:testId/attempts",           auth, teacher, c.getTestAttempts);

/* ── ASSIGNMENTS ── */
router.post  ("/courses/:courseId/assignments",    auth, teacher, c.createAssignment);
router.get   ("/assignments/:assignmentId",        auth, student, c.getAssignment);
router.put   ("/assignments/:assignmentId",        auth, teacher, c.updateAssignment);
router.delete("/assignments/:assignmentId",        auth, teacher, c.deleteAssignment);
router.post  ("/assignments/:assignmentId/submit", auth, requireRole("student"), c.submitAssignment);
router.put   ("/assignments/:assignmentId/submissions/:submissionId/grade", auth, teacher, c.gradeSubmission);

/* ── PROGRESS ── */
router.get   ("/progress/me",                      auth, requireRole("student"), c.getMyProgress);
router.get   ("/courses/:courseId/progress",       auth, teacher, c.getCourseProgress);

module.exports = router;
