const express = require("express");
const router = express.Router();
const { assignUserRole } = require("../../controllers/admin/User_controller");
const { authMiddleware } = require("../../controllers/auth/auth_controller");

// Only allow admin users to change roles
router.put("/assign-role/:id", authMiddleware, assignUserRole);

module.exports = router;
