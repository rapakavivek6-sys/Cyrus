const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { ensureAuth } = require("../middleware/authMiddleware");

router.get("/", ensureAuth, profileController.getProfile);
router.get("/edit", ensureAuth, profileController.getEditProfile);
router.post("/edit", ensureAuth, profileController.postEditProfile);

module.exports = router;
