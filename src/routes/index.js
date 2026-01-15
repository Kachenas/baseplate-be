const express = require("express");
const authRoutes = require("./auth.routes");
const userRoutes = require("./user.routes");
const fileRoutes = require("./file.routes");

const router = express.Router();

// Health check
router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});
console.log("sample here");
// API routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/files", fileRoutes);

module.exports = router;
