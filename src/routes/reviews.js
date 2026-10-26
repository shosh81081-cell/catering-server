import { Router } from "express";
import Review from "../models/Review.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { asyncHandler, httpError } from "../utils/asyncHandler.js";

const router = Router();

// GET /api/reviews - כל התגובות, החדשות קודם (פתוח לכולם)
router.get(
    "/",
    asyncHandler(async (req, res) => {
        const reviews = await Review.find().sort({ createdAt: -1 }).limit(50);
        res.json(reviews);
    })
);

// POST /api/reviews - הוספת תגובה (משתמש מחובר)
router.post(
    "/",
    requireAuth,
    asyncHandler(async (req, res) => {
        const { rating, text } = req.body;
        if (!text || !rating) throw httpError(400, "יש למלא דירוג ותגובה");
        const review = await Review.create({
            user: req.user._id,
            name: req.user.name,
            rating,
            text
        });
        res.status(201).json(review);
    })
);

// DELETE /api/reviews/:id - מחיקת תגובה (מנהל בלבד)
router.delete(
    "/:id",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) throw httpError(404, "תגובה לא נמצאה");
        res.status(204).end();
    })
);

export default router;