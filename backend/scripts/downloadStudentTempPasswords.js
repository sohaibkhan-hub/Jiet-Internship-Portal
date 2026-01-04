import axios from "axios";
import fs from "fs";
import path from "path";

const API_URL = "http://localhost:4000/api/v1/admins/download-temp-passwords";
const OUTPUT_PATH = path.join("public", "temp", "student_temp_passwords.xlsx");

async function downloadExcel() {
  try {
    // Make POST request to your backend API
    const response = await axios.post(API_URL, {}, {
      responseType: "arraybuffer"
    });

    // Ensure output directory exists
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

    // Write file
    fs.writeFileSync(OUTPUT_PATH, response.data);
    console.log(`Excel file saved to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Failed to download Excel:", err.message);
    process.exit(1);
  }
}

downloadExcel();
