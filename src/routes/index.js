const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index", { title: "CYRUS - Collaborative Art Board" });
});

module.exports = router;
