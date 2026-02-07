import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configuration
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Uploads a file to Cloudinary and deletes it from local server

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "college_internship_system",
    });

    console.log("response", response);
    

    fs.unlinkSync(localFilePath); // Clean up local file
    return response;

  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    return null;
  }
};

// Deletes a file from Cloudinary using its Public ID
const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;

    // Use 'raw' for PDFs/Docs, 'image' for JPG/PNG
    // If you are uploading PDFs, you MUST pass 'raw' or 'auto' here.
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType 
    });
    
    return result;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
};

// Helper to extract Public ID from a full Cloudinary URL
// Example URL: https://res.cloudinary.com/demo/image/upload/v12345/college_internship_system/my_resume.pdf
const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Split the URL to get the last part (folder/filename)
  // This logic assumes your URL structure is standard
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1]; // "my_resume.pdf"
  const fileName = lastPart.split('.')[0]; // "my_resume" (remove extension)
  
  // If you used a folder, you might need to extract that too depending on setup
  // For standard uploads, usually just the filename works if not in nested folders
  // But safest is to store public_id in DB alongside URL.
  
  return `college_internship_system/${fileName}`; 
};

export { uploadOnCloudinary, deleteFromCloudinary, getPublicIdFromUrl };