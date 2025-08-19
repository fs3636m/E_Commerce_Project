
const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { chat, ask, health } = require("../../controllers/ai/ai_controller");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,             // 20 req/min/IP
  standardHeaders: true,
  legacyHeaders: false,
});

router.get("/ai/health", health);
router.post("/ai/chat", aiLimiter, chat);
router.post("/ai/ask", aiLimiter, ask);

module.exports = router;
