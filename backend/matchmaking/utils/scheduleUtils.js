const MIN_SLOT_DURATION_MS = 5 * 60 * 1000; // 5 minutes sanity guard
const CANONICAL_WEEK_START_UTC = Date.UTC(2025, 0, 13, 0, 0, 0, 0); // Monday, Jan 13 2025

const toDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value received: ${value}`);
  }
  return date;
};

const getWeekStartUtc = (date) => {
  const day = date.getUTCDay() || 7; // convert Sunday (0) to 7
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  start.setUTCDate(start.getUTCDate() - (day - 1));
  start.setUTCHours(0, 0, 0, 0);
  return start;
};

const shiftToCanonicalWeek = (date) => {
  const weekStart = getWeekStartUtc(date);
  const offsetMs = date.getTime() - weekStart.getTime();
  return new Date(CANONICAL_WEEK_START_UTC + offsetMs);
};

const normalizeSlot = (slot) => {
  if (!slot || !slot.start || !slot.end) {
    throw new Error("Slot is missing start/end properties");
  }

  const originalStart = toDate(slot.start);
  const originalEnd = toDate(slot.end);

  if (originalEnd.getTime() - originalStart.getTime() < MIN_SLOT_DURATION_MS) {
    throw new Error(
      `Slot duration too short. Received start=${slot.start} end=${slot.end}`
    );
  }

  const start = shiftToCanonicalWeek(originalStart);
  const end = shiftToCanonicalWeek(originalEnd);

  return {
    start,
    end,
    id: slot.id || `${start.toISOString()}-${end.toISOString()}`,
    title: slot.title || "Availability",
    source: slot.source || "unknown",
  };
};

const sortSlotsAscending = (slots) =>
  slots
    .map(normalizeSlot)
    .sort((a, b) => a.start.getTime() - b.start.getTime());

const intersectTwoSchedules = (aSlots, bSlots) => {
  const result = [];
  let aIndex = 0;
  let bIndex = 0;

  while (aIndex < aSlots.length && bIndex < bSlots.length) {
    const aSlot = aSlots[aIndex];
    const bSlot = bSlots[bIndex];

    const latestStart = new Date(
      Math.max(aSlot.start.getTime(), bSlot.start.getTime())
    );
    const earliestEnd = new Date(
      Math.min(aSlot.end.getTime(), bSlot.end.getTime())
    );

    if (latestStart < earliestEnd) {
      result.push({
        start: latestStart,
        end: earliestEnd,
        sources: [aSlot.source ?? "unknown", bSlot.source ?? "unknown"],
      });
    }

    if (aSlot.end < bSlot.end) {
      aIndex += 1;
    } else {
      bIndex += 1;
    }
  }

  return result;
};

const intersectSchedules = (schedules) => {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return [];
  }
  if (schedules.length === 1) {
    return schedules[0];
  }

  return schedules
    .slice(1)
    .reduce(
      (accumulator, schedule) => intersectTwoSchedules(accumulator, schedule),
      schedules[0]
    );
};

const totalDurationMinutes = (intervals) =>
  intervals.reduce(
    (minutes, interval) =>
      minutes + (interval.end.getTime() - interval.start.getTime()) / 60000,
    0
  );

const serializeIntervals = (intervals) =>
  intervals.map((interval) => ({
    start: interval.start.toISOString(),
    end: interval.end.toISOString(),
    durationMinutes:
      (interval.end.getTime() - interval.start.getTime()) / 60000,
  }));

const summarizeSchedule = (slots) => ({
  totalSlots: slots.length,
  totalMinutes: totalDurationMinutes(slots),
});

module.exports = {
  sortSlotsAscending,
  intersectTwoSchedules,
  intersectSchedules,
  totalDurationMinutes,
  serializeIntervals,
  summarizeSchedule,
};

