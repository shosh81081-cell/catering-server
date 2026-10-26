import { Router } from "express";
import Order, { ORDER_STATUSES, PAYMENT_METHODS, DEPOSIT_RATE } from "../models/Order.js";
import Dish from "../models/Dish.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler, httpError } from "../utils/asyncHandler.js";

const router = Router();
router.use(requireAuth); // כל נתיבי ההזמנות דורשים התחברות

// מוצא הזמנה ובודק שהמשתמש רשאי לראות אותה (בעלים או מנהל)
async function findAllowedOrder(req) {
  const order = await Order.findById(req.params.id).populate("user", "name email phone");
  if (!order) throw httpError(404, "הזמנה לא נמצאה");
  const isOwner = order.user._id.equals(req.user._id);
  if (!isOwner && req.user.role !== "admin") throw httpError(403, "אין הרשאה להזמנה זו");
  return order;
}

// GET /api/orders/options - סטטוסים ואמצעי תשלום (לתפריטי בחירה)
router.get("/options", (req, res) =>
  res.json({ statuses: ORDER_STATUSES, paymentMethods: PAYMENT_METHODS, depositRate: DEPOSIT_RATE })
);

// GET /api/orders?status=אושרה&sort=eventDate
// מנהל רואה את כל ההזמנות, לקוח רואה רק את שלו
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = req.user.role === "admin" ? {} : { user: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const sort = req.query.sort === "eventDate" ? { eventDate: 1 } : { createdAt: -1 };
    const orders = await Order.find(filter).sort(sort).populate("user", "name email phone");
    res.json(orders);
  })
);

// GET /api/orders/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => res.json(await findAllowedOrder(req)))
);

// POST /api/orders
// body: { eventName, eventDate, guests, address, notes, paymentMethod, items: [{ dishId, quantity }] }
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { eventName, eventDate, guests, address, notes, paymentMethod, items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      throw httpError(400, "יש לבחור לפחות מנה אחת");
    }
    if (eventDate && new Date(eventDate) < new Date()) {
      throw httpError(400, "תאריך האירוע חייב להיות עתידי");
    }

    // המחירים נלקחים מהמסד ולא מהלקוח, כדי שלא יוכלו לשנות אותם
    const orderItems = [];
    for (const { dishId, quantity } of items) {
      const dish = await Dish.findById(dishId);
      if (!dish || !dish.available) throw httpError(400, "אחת המנות אינה זמינה");
      if (!Number.isInteger(quantity) || quantity < 1) {
        throw httpError(400, "כמות חייבת להיות מספר שלם חיובי");
      }
      orderItems.push({ dish: dish._id, name: dish.name, price: dish.price, quantity });
    }

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const order = await Order.create({
      user: req.user._id,
      eventName,
      eventDate,
      guests,
      address,
      notes,
      paymentMethod,
      items: orderItems,
      total,
      deposit: Math.round(total * DEPOSIT_RATE)
    });
    res.status(201).json(order);
  })
);

// PATCH /api/orders/:id/cancel - לקוח מבטל הזמנה שלו (רק לפני אישור)
router.patch(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const order = await findAllowedOrder(req);
    if (req.user.role !== "admin" && order.status !== "ממתינה לאישור") {
      throw httpError(400, "ניתן לבטל רק הזמנה שממתינה לאישור");
    }
    order.status = "בוטלה";
    await order.save();
    res.json(order);
  })
);

// PATCH /api/orders/:id - מנהל בלבד: עדכון סטטוס, תשלום מקדמה ופריטי קנייה נוספים
// body: { status?, depositPaid?, extraItems? }
router.patch(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const order = await findAllowedOrder(req);
    const { status, depositPaid, extraItems } = req.body;
    if (status !== undefined) order.status = status;
    if (depositPaid !== undefined) order.depositPaid = depositPaid;
    if (extraItems !== undefined) order.extraItems = extraItems;
    await order.save();
    res.json(order);
  })
);

// GET /api/orders/:id/shopping-list - מנהל בלבד
// מחשב את כל המצרכים לפי המנות והכמויות, ומוסיף את הפריטים הנוספים
router.get(
  "/:id/shopping-list",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const order = await findAllowedOrder(req);
    const totals = new Map(); // key: "שם|יחידה"

    const add = (name, unit, amount) => {
      const key = `${name}|${unit}`;
      const current = totals.get(key) || { name, unit, amount: 0 };
      current.amount += amount;
      totals.set(key, current);
    };

    for (const item of order.items) {
      const dish = await Dish.findById(item.dish);
      if (!dish) continue; // מנה שנמחקה מהתפריט
      for (const ing of dish.ingredients) add(ing.name, ing.unit, ing.amount * item.quantity);
    }

    const ingredients = [...totals.values()].map((i) => ({
      ...i,
      amount: Math.round(i.amount * 100) / 100
    }));

    res.json({
      orderId: order._id,
      eventName: order.eventName,
      eventDate: order.eventDate,
      ingredients,
      extraItems: order.extraItems
    });
  })
);

// DELETE /api/orders/:id - מנהל בלבד
router.delete(
  "/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) throw httpError(404, "הזמנה לא נמצאה");
    res.status(204).end();
  })
);

export default router;
