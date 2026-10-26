import { Router } from "express";
import Dish, { CATEGORIES } from "../models/Dish.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler, httpError } from "../utils/asyncHandler.js";

const router = Router();

const SORTS = {
  name: { name: 1 },
  price: { price: 1 },
  "-price": { price: -1 },
  newest: { createdAt: -1 }
};

// GET /api/dishes/categories - רשימת הקטגוריות (לתפריט בחירה)
router.get("/categories", (req, res) => res.json(CATEGORIES));

// GET /api/dishes?search=עוף&category=עיקריות&sort=price
// פתוח לכולם, גם ללא התחברות
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { search, category, sort } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    const dishes = await Dish.find(filter).sort(SORTS[sort] || SORTS.name);
    res.json(dishes);
  })
);

// GET /api/dishes/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const dish = await Dish.findById(req.params.id);
    if (!dish) throw httpError(404, "מנה לא נמצאה");
    res.json(dish);
  })
);

// POST /api/dishes - מנהל בלבד
router.post(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const dish = await Dish.create(req.body);
    res.status(201).json(dish);
  })
);

// PUT /api/dishes/:id - מנהל בלבד
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!dish) throw httpError(404, "מנה לא נמצאה");
    res.json(dish);
  })
);

// DELETE /api/dishes/:id - מנהל בלבד
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const dish = await Dish.findByIdAndDelete(req.params.id);
    if (!dish) throw httpError(404, "מנה לא נמצאה");
    res.status(204).end();
  })
);

export default router;
