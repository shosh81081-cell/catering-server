import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRouter from "./routes/auth.js";
import dishesRouter from "./routes/dishes.js";
import ordersRouter from "./routes/orders.js";
import reviewsRouter from "./routes/reviews.js";

const app = express();
const PORT = process.env.PORT || 3000;

// מאפשר לצד הלקוח לפנות לשרת
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/api/reviews", reviewsRouter);

app.get("/", (req, res) => res.json({ message: "שרת הקייטרינג פועל" }));
app.use("/api/auth", authRouter);
app.use("/api/dishes", dishesRouter);
app.use("/api/orders", ordersRouter);

app.use((req, res) => res.status(404).json({ error: "נתיב לא קיים" }));

// מטפל שגיאות מרכזי - כל שגיאה בשרת מגיעה לכאן
app.use((err, req, res, next) => {
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((e) => e.message).join(", ");
    return res.status(400).json({ error: message });
  }
  if (err.name === "CastError") return res.status(400).json({ error: "מזהה לא תקין" });
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: "שגיאת שרת" });
});

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
