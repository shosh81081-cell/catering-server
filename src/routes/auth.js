import { Router } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler, httpError } from "../utils/asyncHandler.js";

const router = Router();

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register  body: { name, email, phone, password }
// משתמש חדש נרשם תמיד כלקוח. מנהל נוצר רק דרך npm run seed
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      throw httpError(400, "יש למלא שם, אימייל, טלפון וסיסמה");
    }
    if (password.length < 6) throw httpError(400, "הסיסמה חייבת להכיל לפחות 6 תווים");
    if (await User.findOne({ email: email.toLowerCase() })) {
      throw httpError(409, "האימייל כבר רשום במערכת");
    }
    const user = await User.create({ name, email, phone, password });
    res.status(201).json({ token: createToken(user), user });
  })
);

// POST /api/auth/login  body: { email, password }
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) throw httpError(400, "יש למלא אימייל וסיסמה");
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.checkPassword(password))) {
      throw httpError(401, "אימייל או סיסמה שגויים");
    }
    res.json({ token: createToken(user), user });
  })
);

// GET /api/auth/me  - מחזיר את המשתמש המחובר (לבדיקה בטעינת האתר)
router.get("/me", requireAuth, (req, res) => res.json(req.user));

export default router;
