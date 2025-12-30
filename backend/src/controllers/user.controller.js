import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Student } from "../models/student.model.js";
import { Faculty } from "../models/faculty.model.js";

const generateAccessTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    return { accessToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong in generating access token");
  }
};

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

    // College email validation
  if (!email.endsWith("@jietjodhpur.ac.in")) {
    throw new ApiError(400, "Login with a valid college email");
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User account is inactive");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken } = await generateAccessTokens(user._id);

  // Save accessToken in user document
  user.accessToken = accessToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: {email: loggedInUser.email, role: loggedInUser.role }, accessToken },
        "Login successful"
      )
    );
});

// Get Current User
const getCurrentUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Fetch profile data based on role
  let profileData = null;

  if (user.role === "STUDENT" && user.profileId) {
    profileData = await Student.findById(user.profileId)
      .populate("branch", "name code programType")
      .populate("internshipData.preferredDomains", "name description")
      .populate("internshipData.allocatedCompany", "name description")
      .populate({
        path: "internshipData.choices",
        populate: [
          { path: "company", select: "name company description" },
        ]
      });
  } else if ((user.role === "FACULTY"|| user.role === "ADMIN")  && user.profileId) {
    profileData = await Faculty.findById(user.profileId).populate("branch", "name code programType");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user, profile: profileData },
        "Current user fetched successfully"
      )
    );
});

// Change Password
const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  if (!oldPassword || !newPassword || !confirmPassword) {
    throw new ApiError(400, "All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New passwords do not match");
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, "New password must be at least 6 characters long");
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.comparePassword(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized");
  }

  // Remove refreshToken from user document
  await User.findByIdAndUpdate(
    userId,
    { $unset: { accessToken: 1 } },
    { new: true }
  );

  // Clear access token cookie if set
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  });

  return res.status(200).json(new ApiResponse(200, {}, "Logout successful"));
});

// Delete all user and student data (FOR TESTING PURPOSES ONLY)
const deleteAllUsersAndStudents = asyncHandler(async (req, res) => {
  await User.deleteMany({});
  await Student.deleteMany({});
  return res.status(200).json(new ApiResponse(200, {}, "All users and students deleted"));
});

export {
  loginUser,
  getCurrentUser,
  changePassword,
  logoutUser,
  generateAccessTokens,
  deleteAllUsersAndStudents,
};
