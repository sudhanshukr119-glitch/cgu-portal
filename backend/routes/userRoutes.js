const router = require("express").Router();
const { auth, requireRole, logActivity } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/userController");

// Admin only
router.get("/",          auth, requireRole("admin"), ctrl.getUsers);
router.post("/",         auth, requireRole("admin"), logActivity("CREATE_USER","users"), ctrl.createUser);
router.put("/:id",       auth, requireRole("admin"), logActivity("UPDATE_USER","users"), ctrl.updateUser);
router.delete("/:id",    auth, requireRole("admin"), logActivity("DELETE_USER","users"), ctrl.deleteUser);
router.get("/analytics", auth, requireRole("admin"), ctrl.getAnalytics);
router.get("/logs",      auth, requireRole("admin"), ctrl.getLogs);

// All authenticated
router.get("/faculty",   auth, ctrl.getFaculty);

module.exports = router;
