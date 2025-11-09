const express = require("express");
const matchController = require("./controllers/matchController");

const router = express.Router();

router.get("/health", (_req, res) =>
  res.json({ status: "ok", service: "matchmaking" })
);

router.get("/hobbies", matchController.searchHobbies);

router.post("/matches", matchController.createMatchPlan);

module.exports = router;

