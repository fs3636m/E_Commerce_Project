const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");

// ✅ Register User
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });

    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashPassword,
    });

    await user.save();
    res.status(200).json({
      success: true,
      message: "User created successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ✅ Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.status(404).json({
        success: false,
        message: "User doesn't exist! Please register first",
      });

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUser.password
    );
    if (!checkPasswordMatch)
      return res.status(401).json({
        success: false,
        message: "Invalid password! Please try again",
      });

    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
        email: checkUser.email,
        username: checkUser.username,
      },
      process.env.CLIENT_SECRET_KEY,
      { expiresIn: "60m" }
    );

    // res.cookie("token", token, { httpOnly: true, secure: true }).json({
    //   success: true,
    //   message: "Logged in successfully",
    //   token,
    //   user: {
    //     id: checkUser._id,
    //     username: checkUser.username,
    //     email: checkUser.email,
    //     role: checkUser.role,
    //   },
    // });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: {
        id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email,
        role: checkUser.role,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ✅ Logout
const logoutUser = (req, res) => {
  res
    .clearCookie("token")
    .status(200)
    .json({ success: true, message: "Logged out successfully" });
};

// ✅ Auth Middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
 
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });

  try {
    const decoded = jwt.verify(token, process.env.CLIENT_SECRET_KEY);
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorized user!",
    });
  }
};

// ✅ Exports
module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
};
