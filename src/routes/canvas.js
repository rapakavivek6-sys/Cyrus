const express = require("express");
const router = express.Router();
const canvasController = require("../controllers/canvasController");
const { ensureAuth } = require("../middleware/authMiddleware");

router.get("/", ensureAuth, canvasController.getCanvas);
router.post("/save", ensureAuth, canvasController.postSaveCanvas);

module.exports = router;
