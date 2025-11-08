require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const defaultAllowedOrigins = ["http://localhost:5173"];
const allowedOrigins = (
  process.env.CLIENT_ORIGIN ||
  process.env.ALLOWED_ORIGINS ||
  ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const resolveAllowedOrigin = (origin) => {
  if (!origin) return null;
  if (allowedOrigins.length === 0 && defaultAllowedOrigins.includes(origin)) {
    return origin;
  }
  if (allowedOrigins.includes(origin)) {
    return origin;
  }
  return null;
};

app.use((req, res, next) => {
  const requestOrigin = req.get("origin");
  const allowOrigin = resolveAllowedOrigin(requestOrigin);

  if (allowOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowOrigin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.get("Access-Control-Request-Headers") || "Content-Type,Authorization"
  );
  res.setHeader("Access-Control-Max-Age", "600");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// parse JSON bodies
app.use(express.json());

// wire auth routes
const authRoutes = require("./auth/routes");
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Hello from InterLink Backend!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
