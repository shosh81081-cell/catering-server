import dns from "node:dns";
import mongoose from "mongoose";

// שימוש בשרתי DNS של Google, כדי לפענח את כתובת MongoDB Atlas
dns.setServers(["8.8.8.8", "1.1.1.1"]);

// חיבור למסד הנתונים MongoDB
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("חסר MONGO_URI בקובץ .env");
    process.exit(1);
  }
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("DB ERROR:", err.message);
    process.exit(1);
  }
}