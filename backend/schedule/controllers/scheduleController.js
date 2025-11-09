const scheduleStore = require("../store");

const DEFAULT_SLOT_TITLE = "Availability";

const parseDate = (value) => {
  if (typeof value !== "string") {
    throw new Error("start and end must be ISO-8601 strings");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value received: ${value}`);
  }
  return date;
};

const normalizeSlot = (slot, index) => {
  if (!slot || typeof slot !== "object") {
    throw new Error("Each slot must be an object");
  }

  const startDate = parseDate(slot.start);
  const endDate = parseDate(slot.end);

  if (endDate.getTime() <= startDate.getTime()) {
    throw new Error("Slot end must be after start");
  }

  const id =
    typeof slot.id === "string" && slot.id.trim().length > 0
      ? slot.id.trim()
      : `slot-${index}`;

  const title =
    typeof slot.title === "string" && slot.title.trim().length > 0
      ? slot.title.trim()
      : DEFAULT_SLOT_TITLE;

  const normalized = {
    id,
    title,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };

  if (typeof slot.color === "string" && slot.color.trim().length > 0) {
    normalized.color = slot.color.trim();
  }

  return normalized;
};

const validateUserId = (userId) => {
  if (typeof userId !== "string" || userId.trim().length === 0) {
    const error = new Error("userId is required");
    error.status = 400;
    throw error;
  }
  return userId.trim();
};

exports.getSchedule = async (req, res) => {
  try {
    const userId = validateUserId(req.params.userId);
    const slots = await scheduleStore.getSlots(userId);
    return res.status(200).json({ slots });
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json({ error: error.message || "Failed to fetch schedule" });
  }
};

exports.replaceSchedule = async (req, res) => {
  try {
    const userId = validateUserId(req.params.userId);
    const { slots } = req.body || {};

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        error: "slots must be an array of availability blocks",
      });
    }

    const normalizedSlots = slots.map(normalizeSlot);

    const stored = await scheduleStore.setSlots(userId, normalizedSlots);

    return res.status(200).json({ slots: stored });
  } catch (error) {
    const status = error.status || 400;
    return res
      .status(status)
      .json({ error: error.message || "Failed to save schedule" });
  }
};

exports.clearSchedule = async (req, res) => {
  try {
    const userId = validateUserId(req.params.userId);
    await scheduleStore.clearSlots(userId);
    return res.status(204).send();
  } catch (error) {
    const status = error.status || 500;
    return res
      .status(status)
      .json({ error: error.message || "Failed to clear schedule" });
  }
};
