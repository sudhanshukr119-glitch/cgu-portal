const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getPosts, createPost, updatePost, deletePost } = require("../controllers/lostFoundController");

router.get("/",    auth, getPosts);
router.post("/",   auth, requireRole("student", "teacher", "admin"), createPost);
router.put("/:id", auth, updatePost);    // ownership checked in controller
router.delete("/:id", auth, deletePost); // ownership checked in controller

module.exports = router;
