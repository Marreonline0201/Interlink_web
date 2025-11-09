const express = require("express");
const scheduleController = require("./controllers/scheduleController");

const router = express.Router();

router.get("/:userId", scheduleController.getSchedule);
router.put("/:userId", scheduleController.replaceSchedule);
router.delete("/:userId", scheduleController.clearSchedule);

module.exports = router;


