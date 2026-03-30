const router = require("express").Router();
const { auth, requireRole, requirePermission, logActivity } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/authController");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", auth, ctrl.getMe);
router.put("/profile", auth, logActivity("UPDATE_PROFILE", "auth"), ctrl.updateProfile);
router.put("/change-password", auth, logActivity("CHANGE_PASSWORD", "auth"), ctrl.changePassword);

module.exports = router;
