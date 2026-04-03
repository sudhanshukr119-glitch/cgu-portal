const router = require("express").Router();
const { auth } = require("../middleware/authMiddleware");
const { getListings, createListing, updateListing, deleteListing, getMessages, sendMessage } = require("../controllers/marketplaceController");

router.get("/",                    auth, getListings);
router.post("/",                   auth, createListing);
router.put("/:id",                 auth, updateListing);
router.delete("/:id",              auth, deleteListing);
router.get("/:id/messages",        auth, getMessages);
router.post("/:id/messages",       auth, sendMessage);

module.exports = router;
