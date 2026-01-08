import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import userRouter from "./routes/user.route.js";
import studentRouter from "./routes/student.route.js";
import adminRouter from "./routes/admin.route.js";
import branchDomainRouter from "./routes/branchDomain.route.js";
import companyRouter from "./routes/company.route.js";
import tpoRouter from "./routes/tpo.route.js";
import path from "path";
import compression from "compression";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// CORS Setup
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  }),
);

app.set("trust proxy", 1);

// Body parsers and other middleware
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(helmet());
app.use(compression());

// build
const __dirname = path.resolve();

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    statusCode: 429,
    success: false,
    message: "Too many requests, please try again after 15 minutes",
    data: null,
    errors: "",
  },
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    // Log to backend console
    console.log(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(options.statusCode).json(options.message);
  },
});

app.use(limiter);

// Routers import
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/students", studentRouter);
app.use("/api/v1/branch-domain", branchDomainRouter);
app.use("/api/v1/companies", companyRouter);
app.use("/api/v1/tpo", tpoRouter);
app.use("/api/v1/active", (req, res) => {
  res.send({ status: "active2" });
});

app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist", "index.html"));
});
// app.use('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend', 'dist', 'index.html'));
// });

app.use((err, req, res, next) => {

  // If the error is your custom ApiError, use its properties
  if (err.statusCode && err.message) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      data: err.data || null,
      errors: err.errors || "",
    });
  }

  // For other/unexpected errors
  res.status(500).json({
    statusCode: 500,
    success: false,
    message: "Internal Server Error",
    data: null,
    errors: err ? err.message : "",
  });
});

// Export the app
export { app };
