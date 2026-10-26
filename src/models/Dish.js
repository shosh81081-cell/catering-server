import mongoose from "mongoose";

export const CATEGORIES = ["ראשונות", "עיקריות", "תוספות", "סלטים", "קינוחים", "שתייה"];

// מצרך שנדרש להכנת מנה אחת (למשל: 0.2 ק"ג חזה עוף)
const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true } // ק"ג, יחידות, ליטר...
  },
  { _id: false }
);

const dishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: 0 }, // מחיר למנה אחת
    image: { type: String, default: "" }, // כתובת תמונה
    available: { type: Boolean, default: true },
    ingredients: { type: [ingredientSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Dish", dishSchema);
