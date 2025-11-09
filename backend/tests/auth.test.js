process.env.SUPABASE_USE_STUB = "true";

const { describe, beforeEach, test } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");

const { createApp } = require("../app");
const supabase = require("../auth/services/supabaseClient");

const app = createApp();

describe("Auth routes", () => {
  beforeEach(() => {
    if (typeof supabase.__reset === "function") {
      supabase.__reset();
    }
  });

  test("POST /auth/signup registers a user with metadata", async () => {
    const payload = {
      email: "student@example.edu",
      password: "SafePassword!123",
      name: "Student Example",
      hobbies: ["ai club", "robotics"],
      major: "Computer Science",
    };

    const response = await request(app)
      .post("/auth/signup")
      .send(payload)
      .expect(201);

    assert.ok(response.body.user, "Expected response to include user");
    assert.equal(response.body.user.email, payload.email);
    assert.equal(
      response.body.user.user_metadata.name,
      payload.name,
      "Expected metadata name to be persisted"
    );
    assert.deepEqual(
      response.body.user.user_metadata.hobbies,
      payload.hobbies,
      "Expected metadata hobbies to be persisted"
    );
  });

  test("POST /auth/signin returns a session and user", async () => {
    const credentials = {
      email: "student@example.edu",
      password: "SafePassword!123",
    };

    await request(app).post("/auth/signup").send({
      ...credentials,
      name: "Auth Signer",
    });

    const response = await request(app)
      .post("/auth/signin")
      .send(credentials)
      .expect(200);

    assert.ok(response.body.session, "Expected session in response");
    assert.ok(
      response.body.session.access_token,
      "Expected session to contain access token"
    );
    assert.equal(response.body.user.email, credentials.email);
  });

  test("GET /auth/profile requires a valid bearer token", async () => {
    const credentials = {
      email: "protected@example.edu",
      password: "SafePassword!123",
    };

    await request(app).post("/auth/signup").send({
      ...credentials,
      name: "Protected Example",
      focusArea: "Quantum Networking",
    });

    const signInResponse = await request(app)
      .post("/auth/signin")
      .send(credentials)
      .expect(200);

    const token = signInResponse.body.session.access_token;

    await request(app).get("/auth/profile").expect(401);

    const profileResponse = await request(app)
      .get("/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    assert.equal(profileResponse.body.user.email, credentials.email);
  });
});

