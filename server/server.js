require("dotenv").config();

const connectToDatabase = require("./database/db");
const authRouter = require("./routes/auth-routes");
const adminRouter = require("./routes/admin-routes");
const productRouter = require("./routes/product-routes");
const checkoutRouter = require("./routes/checkout-routes");
const webhookRouter = require("./routes/webhook-routes");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const express = require("express");
const { Redis } = require("@upstash/redis");
const PORT = process.env.PORT;
const app = express();

app.use(passport.initialize());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_ROOT_URI}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      // This callback is invoked after Google consents:
      //  - profile.id, profile.emails[0].value, profile.displayName, profile.photos[0].value
      const User = require("./models/User");
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0].value,
          password: null,
        });
      }
      return done(null, user);
    }
  )
);

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// Database
connectToDatabase();

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests, please try again later.",
  },
});

//middlewares
app.use(globalLimiter);
app.use(
  cors({
    origin:
      process.env.MODE === "development"
        ? "http://localhost:5173"
        : "https://billify-ecommerce.vercel.app",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"],
    optionsSuccessStatus: 200, // For legacy browser support
  })
);

// Stripe webhook - MUST be before express.json() middleware
app.use("/api/webhook", webhookRouter);

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  req.redisClient = redis;
  next();
});

//routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/product", productRouter);
app.use("/api/checkout", checkoutRouter);

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
