const fs = require("fs");
const path = require("path");

const envPath = path.resolve(__dirname, ".env");
console.log(".env exists?", fs.existsSync(envPath));

require("dotenv").config();
console.log("Test JWT_SECRET:", process.env.JWT_SECRET);
