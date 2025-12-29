import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Get the token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // If no token is provided, throw an unauthorized error
    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // Include accessToken for verification, but exclude password
    const user = await User.findById(decodedToken._id).select("+accessToken -password");

    if (!user) {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    }

    // Check if the token matches the one stored in DB
    if (!user.accessToken || user.accessToken !== token) {
      throw new ApiError(401, "Unauthorized request: Token is not active (logged out)");
    }

    // Attach the user to the request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, "Unauthorized request: Token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new ApiError(401, "Unauthorized request: Invalid token");
    } else {
      // General error handling
      throw new ApiError(
        401,
        "Unauthorized request: Failed to authenticate token",
      );
    }
  }
});
