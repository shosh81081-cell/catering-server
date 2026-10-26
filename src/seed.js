// הרצה: npm run seed
// יוצר משתמש מנהל ומנות לדוגמה. מנות קיימות נמחקות ונוצרות מחדש.
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Dish from "./models/Dish.js";

const dishes = [
  {
    name: "שניצל עוף",
    description: "שניצל פריך מחזה עוף טרי",
    category: "עיקריות",
    price: 45,
    ingredients: [
      { name: "חזה עוף", amount: 0.2, unit: "ק\"ג" },
      { name: "פירורי לחם", amount: 0.05, unit: "ק\"ג" },
      { name: "ביצים", amount: 1, unit: "יחידות" }
    ]
  },
  {
    name: "פרגית בגריל",
    description: "פרגיות במרינדה ביתית",
    category: "עיקריות",
    price: 55,
    ingredients: [
      { name: "פרגיות", amount: 0.25, unit: "ק\"ג" },
      { name: "שמן זית", amount: 0.02, unit: "ליטר" }
    ]
  },
  {
    name: "אורז לבן",
    description: "אורז מבושל",
    category: "תוספות",
    price: 15,
    ingredients: [{ name: "אורז", amount: 0.1, unit: "ק\"ג" }]
  },
  {
    name: "תפוחי אדמה אפויים",
    description: "בתיבול עשבי תיבול",
    category: "תוספות",
    price: 18,
    ingredients: [{ name: "תפוחי אדמה", amount: 0.25, unit: "ק\"ג" }]
  },
  {
    name: "סלט ירקות",
    description: "ירקות טריים חתוכים",
    category: "סלטים",
    price: 20,
    ingredients: [
      { name: "עגבניות", amount: 0.1, unit: "ק\"ג" },
      { name: "מלפפונים", amount: 0.1, unit: "ק\"ג" }
    ]
  },
  {
    name: "עוגת שוקולד",
    description: "עוגה פרווה עשירה",
    category: "קינוחים",
    price: 30,
    ingredients: [
      { name: "קמח", amount: 0.05, unit: "ק\"ג" },
      { name: "שוקולד מריר", amount: 0.03, unit: "ק\"ג" },
      { name: "ביצים", amount: 0.5, unit: "יחידות" }
    ]
  }
];

await connectDB();

const email = process.env.ADMIN_EMAIL || "admin@catering.com";
if (!(await User.findOne({ email }))) {
  await User.create({
    name: "מנהל",
    email,
    phone: "050-0000000",
    password: process.env.ADMIN_PASSWORD || "admin123",
    role: "admin"
  });
  console.log(`Admin created: ${email}`);
} else {
  console.log("Admin already exists");
}

await Dish.deleteMany({});
await Dish.insertMany(dishes);
console.log(`${dishes.length} dishes created`);

await mongoose.disconnect();
