const { findMatches } = require("../services/matchService");
const { fetchMatchmakingDataset } = require("../data/profileRepository");

const sanitizeStringList = (value) =>
  Array.isArray(value)
    ? value
        .map((entry) => `${entry}`.trim())
        .filter((entry) => entry.length > 0)
    : [];

const sanitizeOptionalString = (value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const sanitizeSeeker = (payload = {}) => {
  const interests = sanitizeStringList(payload.interests);
  const hobbies = sanitizeStringList(payload.hobbies);
  const classes = sanitizeStringList(payload.classes);

  const seeker = {
    id: typeof payload.id === "string" ? payload.id : undefined,
    name: typeof payload.name === "string" ? payload.name : undefined,
    interests,
    hobbies,
  };

  if (classes.length > 0) {
    seeker.classes = classes;
  }

  const major = sanitizeOptionalString(payload.major);
  if (major) seeker.major = major;

  const favoriteSpot = sanitizeOptionalString(payload.favoriteSpot);
  if (favoriteSpot) seeker.favoriteSpot = favoriteSpot;

  const funFact = sanitizeOptionalString(payload.funFact);
  if (funFact) seeker.funFact = funFact;

  const vibeCheck = sanitizeOptionalString(payload.vibeCheck);
  if (vibeCheck) seeker.vibeCheck = vibeCheck;

  return seeker;
};

const sanitizeFilters = (payload = {}) => {
  const filters = {};

  if (Array.isArray(payload.interests)) {
    filters.interests = payload.interests.filter(
      (interest) => typeof interest === "string" && interest.trim().length > 0
    );
  }

  if (Array.isArray(payload.majors)) {
    filters.majors = payload.majors.filter(
      (major) => typeof major === "string" && major.trim().length > 0
    );
  }

  if (Array.isArray(payload.classes)) {
    filters.classes = payload.classes.filter(
      (course) => typeof course === "string" && course.trim().length > 0
    );
  }

  if (payload.requireSameCourse === true) {
    filters.requireSameCourse = true;
  }

  if (typeof payload.hobbyQuery === "string") {
    const trimmed = payload.hobbyQuery.trim();
    if (trimmed.length > 0) {
      filters.hobbyQuery = trimmed;
    }
  }

  return filters;
};

const searchHobbies = async (req, res) => {
  try {
    const rawTerm = typeof req.query.hobby === "string" ? req.query.hobby : "";
    const term = rawTerm.trim().toLowerCase();

    if (!term) {
      return res.status(400).json({
        error: "Query parameter 'hobby' is required",
      });
    }

    const seekerId =
      typeof req.query.seekerId === "string" ? req.query.seekerId : undefined;
    const dataset = await fetchMatchmakingDataset({ seekerId });

    const matches = dataset.candidates
      .map((candidate) => ({
        ...candidate,
        hobbies: Array.isArray(candidate.hobbies) ? candidate.hobbies : [],
        interests: Array.isArray(candidate.interests)
          ? candidate.interests
          : [],
      }))
      .filter((candidate) =>
        candidate.hobbies.some((value) => value.toLowerCase().includes(term))
      )
      .map((candidate) => ({
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        major: candidate.major,
        classes: Array.isArray(candidate.classes) ? candidate.classes : [],
        hobbies: candidate.hobbies,
        interests: candidate.interests,
      }));

    return res.status(200).json({
      total: matches.length,
      results: matches,
    });
  } catch (error) {
    console.error("[matchController.searchHobbies] failed", error);
    return res.status(500).json({
      error: "Failed to search candidates by hobby",
      message: error.message ?? error,
    });
  }
};

const createMatchPlan = async (req, res) => {
  try {
    const { user, availability, mode, filters } = req.body || {};

    if (!Array.isArray(availability) || availability.length === 0) {
      return res.status(400).json({
        error: "availability array is required",
        hint: "Send the serialized slots captured on the Schedule page.",
      });
    }

    const seeker = sanitizeSeeker(user);
    const sanitizedFilters = sanitizeFilters(filters);

    console.debug("[matchController] createMatchPlan payload", {
      seeker,
      filterKeys: Object.keys(sanitizedFilters),
      availabilityCount: availability.length,
      mode,
    });

    const payload = await findMatches({
      seeker,
      availability,
      mode,
      filters: sanitizedFilters,
    });

    return res.status(200).json(payload);
  } catch (error) {
    console.error("[matchController.createMatchPlan] failed", error);
    return res.status(500).json({
      error: "Failed to generate matches",
      message: error.message ?? error,
    });
  }
};

module.exports = {
  createMatchPlan,
  searchHobbies,
};
