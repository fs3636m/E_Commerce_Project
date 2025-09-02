const express = require("express");
const {
  registerUser,
  loginUser,
  authMiddleware,
  logoutUser,
  forgotPassword, 
  resetPassword
} = require("../../controllers/auth/auth_controller");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/check-auth", authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true, 
    message: "User is authenticated!", 
    user
  });
});

module.exports = router;
