import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js"; // Import server (not just app)
import { ApiError } from "./utils/ApiError.js";

dotenv.config({
    path: './.env'
});

// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      data: err.data,
      success: err.success,
      message: err.message,
      error: err.error, // Include any additional error details
    });
  }

  // Handle other errors not covered by ApiError
  return res.status(500).json({
    statusCode: 500,
    data: null,
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    const port = process.env.PORT || 4000;

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });

    // Error handling for server-level errors
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed...", error);
  });
