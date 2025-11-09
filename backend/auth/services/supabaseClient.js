// Lightweight Supabase client wrapper for server-side use.
// Exports a configured supabase client. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
const { createClient } = require("@supabase/supabase-js");
const {
  supabaseUrl: configSupabaseUrl,
  supabaseServiceRoleKey: configSupabaseServiceRoleKey,
} = require("../../config");

const resolvedSupabaseUrl = (
  configSupabaseUrl ||
  process.env.SUPABASE_URL ||
  ""
).trim();
const resolvedServiceRoleKey = (
  configSupabaseServiceRoleKey ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  ""
).trim();

const mask = (value) => {
  if (!value) return "undefined";
  if (value.length <= 8) return `${value[0]}***${value[value.length - 1]}`;
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
};

const shouldUseStub =
  process.env.SUPABASE_USE_STUB === "true" ||
  !resolvedSupabaseUrl ||
  !resolvedServiceRoleKey;

if (shouldUseStub) {
  const stub = require("./supabaseStub");
  module.exports = stub;
  return;
}

console.info("[Supabase] Initialising client", {
  urlConfigured: Boolean(resolvedSupabaseUrl),
  serviceRoleKeyPreview: mask(resolvedServiceRoleKey),
});

const supabaseClient = createClient(
  resolvedSupabaseUrl,
  resolvedServiceRoleKey
);

const statusSnapshot = () => ({
  isConfigured: true,
  supabaseUrl: resolvedSupabaseUrl,
  serviceRoleKeyPreview: mask(resolvedServiceRoleKey),
});

const proxiedSupabase = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "__status") {
        return statusSnapshot;
      }
      if (prop === Symbol.for("nodejs.util.inspect.custom")) {
        return () => ({
          supabaseUrl: resolvedSupabaseUrl || "<not-configured>",
          serviceRoleKeyPreview: mask(resolvedServiceRoleKey),
        });
      }
      const value = supabaseClient[prop];
      if (typeof value === "function") {
        return value.bind(supabaseClient);
      }
      return value;
    },
  }
);

module.exports = proxiedSupabase;
