const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY);

    // Check if token has expired
    const expirationTime = decoded.exp * 1000; // convert to milliseconds
    const currentTime = Date.now();
    if (expirationTime < currentTime) {
      return res.status(401).json({ message: "Token has expired" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT VERIFY ERROR:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware }; // ✅ required for CommonJS
