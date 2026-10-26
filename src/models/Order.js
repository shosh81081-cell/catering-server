import mongoose from "mongoose";

export const ORDER_STATUSES = ["ממתינה לאישור", "אושרה", "בהכנה", "הושלמה", "בוטלה"];
export const PAYMENT_METHODS = ["העברה בנקאית", "אשראי", "מזומן", "צ'ק"];
export const DEPOSIT_RATE = 0.1; // 10% תשלום בעת ההזמנה

// שורה בהזמנה. שומרים עותק של השם והמחיר כדי ששינוי מחיר עתידי לא ישנה הזמנות קיימות
const orderItemSchema = new mongoose.Schema(
  {
    dish: { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

// פריט קנייה נוסף שהמנהל מוסיף ידנית (כלים חד פעמיים, מפות וכו')
const extraItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  unit: { type: String, default: "יחידות", trim: true }
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventName: { type: String, required: true, trim: true },
    eventDate: { type: Date, required: true },
    guests: { type: Number, required: true, min: 1 },
    address: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "ההזמנה חייבת לכלול לפחות מנה אחת"]
    },
    total: { type: Number, required: true },
    deposit: { type: Number, required: true },
    depositPaid: { type: Boolean, default: false },
    paymentMethod: { type: String, required: true, enum: PAYMENT_METHODS },
    status: { type: String, enum: ORDER_STATUSES, default: "ממתינה לאישור" },
    extraItems: { type: [extraItemSchema], default: [] }
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
