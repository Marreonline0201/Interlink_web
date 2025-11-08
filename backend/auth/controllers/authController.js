const supabase = require("../services/supabaseClient");

// Simple controller examples. Adjust to your Supabase client version and security needs.
const logDebug = (method, message, details) => {
  if (details) {
    console.debug(`[AuthController.${method}] ${message}`, details);
  } else {
    console.debug(`[AuthController.${method}] ${message}`);
  }
};

const logError = (method, error) => {
  console.error(`[AuthController.${method}]`, error);
};

exports.signUp = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  logDebug("signUp", "Incoming sign up request", { email });

  try {
    const supabaseStatus =
      typeof supabase.__status === "function"
        ? supabase.__status()
        : { isConfigured: true };
    logDebug("signUp", "Supabase client status", supabaseStatus);

    // Try server-side create (service role) if available
    if (
      supabase.auth &&
      supabase.auth.admin &&
      supabase.auth.admin.createUser
    ) {
      logDebug("signUp", "Attempting Supabase admin createUser");
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
      logDebug("signUp", "Supabase admin createUser succeeded", {
        email,
        userId: data?.user?.id || data?.id,
      });
      return res.status(201).json({ user: data });
    }

    // Fallback: sign up (may require email confirmation depending on Supabase settings)
    if (supabase.auth && supabase.auth.signUp) {
      logDebug("signUp", "Attempting Supabase auth.signUp");
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      logDebug("signUp", "Supabase auth.signUp succeeded", {
        email,
        userId: data?.user?.id || data?.id,
      });
      return res.status(201).json({ user: data });
    }

    logDebug(
      "signUp",
      "Supabase client does not provide supported sign up method"
    );
    return res.status(501).json({
      error: "Supabase client does not expose a supported sign up method",
    });
  } catch (err) {
    logError("signUp", err);
    return res.status(500).json({ error: err.message || err });
  }
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });

  logDebug("signIn", "Incoming sign in request", { email });

  try {
    if (supabase.auth && supabase.auth.signInWithPassword) {
      // v2 API
      logDebug("signIn", "Attempting Supabase signInWithPassword");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      logDebug("signIn", "Supabase signInWithPassword succeeded", {
        email,
        hasSession: Boolean(data?.session),
        hasUser: Boolean(data?.user),
      });
      return res.status(200).json(data);
    }

    if (supabase.auth && supabase.auth.signIn) {
      logDebug("signIn", "Attempting Supabase v1 signIn fallback");
      const { data, error } = await supabase.auth.signIn({ email, password });
      if (error) throw error;
      logDebug("signIn", "Supabase v1 signIn succeeded", {
        email,
        hasSession: Boolean(data?.session),
        hasUser: Boolean(data?.user),
      });
      return res.status(200).json(data);
    }

    // Fallback: no-op
    logDebug(
      "signIn",
      "Supabase client does not expose signIn methods for this version"
    );
    return res
      .status(501)
      .json({ error: "Sign-in not implemented for this client version" });
  } catch (err) {
    logError("signIn", err);
    return res.status(500).json({ error: err.message || err });
  }
};

const allowedMetadataFields = [
  "displayName",
  "headline",
  "company",
  "experienceLevel",
  "focusArea",
  "bio",
  "club",
  "preferredEmail",
  "name",
  "major",
  "age",
  "avatarUrl",
  "bannerUrl",
  "hobbies",
  "metadata",
  "connections",
];

exports.updateProfile = async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  const userId = req.user.id;
  if (!userId)
    return res.status(400).json({ error: "Authenticated user is missing id" });

  const nextEmail =
    typeof req.body.email === "string" && req.body.email.trim()
      ? req.body.email.trim()
      : undefined;

  const metadataUpdates = allowedMetadataFields.reduce((accumulator, field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      accumulator[field] = req.body[field];
    }
    return accumulator;
  }, {});

  const hasMetadataUpdates = Object.keys(metadataUpdates).length > 0;
  const wantsEmailUpdate =
    nextEmail && (!req.user.email || nextEmail !== req.user.email);

  if (!hasMetadataUpdates && !wantsEmailUpdate) {
    return res
      .status(400)
      .json({ error: "No updatable profile fields were provided" });
  }

  if (
    !supabase.auth ||
    !supabase.auth.admin ||
    !supabase.auth.admin.updateUserById
  ) {
    logDebug(
      "updateProfile",
      "Supabase admin client does not expose updateUserById"
    );
    return res
      .status(501)
      .json({ error: "Profile updates are not configured on the server" });
  }

  const attributes = {};

  if (wantsEmailUpdate) {
    attributes.email = nextEmail;
  }

  if (hasMetadataUpdates) {
    const currentMetadata =
      req.user.user_metadata && typeof req.user.user_metadata === "object"
        ? req.user.user_metadata
        : {};

    attributes.user_metadata = {
      ...currentMetadata,
      ...metadataUpdates,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const { data, error } = await supabase.auth.admin.updateUserById(
      userId,
      attributes
    );
    if (error) throw error;
    const updatedUser = data?.user || data;
    logDebug("updateProfile", "Profile updated successfully", {
      userId,
      emailChanged: Boolean(attributes.email),
      metadataKeys: hasMetadataUpdates ? Object.keys(metadataUpdates) : [],
    });
    return res.status(200).json({ user: updatedUser });
  } catch (err) {
    logError("updateProfile", err);
    return res.status(500).json({ error: err.message || err });
  }
};

exports.getProfile = async (req, res) => {
  // authMiddleware should have attached `req.user` if available
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ user: req.user });
};
