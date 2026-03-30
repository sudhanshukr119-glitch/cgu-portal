const router = require("express").Router();
const { auth, requireRole } = require("../middleware/authMiddleware");
const { getMenu, createItem, updateItem, deleteItem } = require("../controllers/menuController");

router.get("/",      auth, getMenu);
router.post("/",     auth, requireRole("admin"), createItem);
router.put("/:id",   auth, requireRole("admin"), updateItem);
router.delete("/:id",auth, requireRole("admin"), deleteItem);

module.exports = router;
