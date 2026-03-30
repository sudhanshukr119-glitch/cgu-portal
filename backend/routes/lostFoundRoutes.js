const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getPosts, createPost, updatePost, deletePost } = require("../controllers/lostFoundController");

router.get("/", auth, getPosts);
router.post("/", auth, requireRole("student", "teacher"), createPost);
router.put("/:id", auth, requireRole("student", "teacher"), updatePost);
router.delete("/:id", auth, requireRole("admin"), deletePost);

module.exports = router;
