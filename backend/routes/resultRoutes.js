const router = require("express").Router();
const { auth, requireRole, logActivity } = require("../middleware/authMiddleware");
const ctrl = require("../controllers/resultController");

router.get("/",           auth, ctrl.getResults);
router.get("/analytics",  auth, requireRole("teacher","admin"), ctrl.getClassAnalytics);
router.post("/",          auth, requireRole("teacher","admin"), logActivity("CREATE_RESULT","results"), ctrl.createResult);
router.put("/:id",        auth, requireRole("teacher","admin"), logActivity("UPDATE_RESULT","results"), ctrl.updateResult);
router.post("/publish",   auth, requireRole("teacher","admin"), logActivity("PUBLISH_RESULTS","results"), ctrl.publishResults);

module.exports = router;
