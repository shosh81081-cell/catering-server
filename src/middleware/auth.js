import jwt from "jsonwebtoken";
import User from "../models/User.js";

// בודק שנשלח טוקן תקין בכותרת Authorization: Bearer <token>
// ושומר את המשתמש המחובר ב-req.user
export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "יש להתחבר למערכת" });

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ error: "משתמש לא קיים" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "החיבור פג תוקף, יש להתחבר מחדש" });
  }
}

// מאפשר גישה רק למנהל. משתמשים בו אחרי requireAuth
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "אין הרשאה לפעולה זו" });
  }
  next();
}
