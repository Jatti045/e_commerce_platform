const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/send-email");

// Helper function for consistent cookie configuration
const getCookieConfig = () => ({
  httpOnly: true,
  secure: process.env.MODE !== "development",
  sameSite: process.env.MODE === "development" ? "lax" : "none",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
  // Additional mobile-friendly settings
  domain:
    process.env.MODE === "development" ? undefined : process.env.COOKIE_DOMAIN,
});

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (username === "" || email === "" || password === "") {
      return res.json({
        success: false,
        message: "Please enter the appropriate credentials.",
      });
    }

    const checkExistingUser = await User.findOne({ email });

    if (checkExistingUser) {
      return res.json({
        success: false,
        message: "User with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newlyCreatedUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newlyCreatedUser.save();

    if (newlyCreatedUser) {
      await sendEmail(
        email,
        "🎉 Welcome to Billify - Your Shopping Journey Starts Now!",
        `Hi ${username},  

        Welcome to Billify - your ultimate destination for a seamless and premium shopping experience! 🎉  

        Your account has been successfully created, and you're now part of an exclusive shopping community where quality meets convenience.  

        🛍 Start Exploring Now → *Link*  

        If you ever have any questions or need assistance, our support team is here to help.  

        Happy shopping, and thank you for choosing Billify!

        Best regards,  
        The Billify Team  
        `
      );

      res.json({
        success: true,
        message: "User registered successfully.",
      });
    } else {
      res.json({
        success: false,
        message: "User could not be registered. Please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === "" || password === "") {
      return res.json({
        success: false,
        message: "Please enter the appropriate credentials.",
      });
    }

    const checkExistingUser = await User.findOne({ email });

    if (!checkExistingUser) {
      return res.json({
        success: false,
        message: "User with this email does not exist.",
      });
    }

    const isPasswordSame = await bcrypt.compare(
      password,
      checkExistingUser.password
    );

    if (!isPasswordSame) {
      return res.json({
        success: false,
        message: "Incorrect password. Please try again.",
      });
    }

    const user = {
      userId: checkExistingUser._id,
      username: checkExistingUser.username,
      role: checkExistingUser.role,
    };

    const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("token", token, getCookieConfig()).json({
      success: true,
      message: "Logged in successfully.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.json({
      success: false,
      message: "Incorrect password. Please try again.",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    const cookieConfig = getCookieConfig();
    // Remove maxAge for clearing cookie
    delete cookieConfig.maxAge;

    res.clearCookie("token", cookieConfig).status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Incorrect password. Please try again.",
    });
  }
};

const checkAuth = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user. Please log in.",
      });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decodedToken;
    res.status(200).json({
      success: true,
      message: "User is authenticated.",
      user: decodedToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Authentication failed. Please log in again.",
    });
  }
};

const googleAuthCallback = (req, res) => {
  // req.user was set by Passport strategy
  const user = {
    userId: req.user._id,
    username: req.user.username,
    role: req.user.role,
  };

  const token = jwt.sign(user, process.env.JWT_SECRET_KEY, {
    expiresIn: "7d",
  });

  // set cookie (adjust secure/sameSite for your environment)
  res
    .cookie("token", token, getCookieConfig())
    // if you want JSON instead of redirect, use res.json(...)
    .redirect(`${process.env.CLIENT_ROOT_URI}/user/home`);
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  checkAuth,
  googleAuthCallback,
};
