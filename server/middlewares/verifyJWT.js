const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY); // ✅
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = verifyJWT;
