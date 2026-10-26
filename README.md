# שרת קייטרינג

Node.js + Express + MongoDB, עם התחברות (JWT) ושני סוגי משתמשים: לקוח ומנהל.

## התקנה

1. צרי מסד נתונים חינמי ב-MongoDB Atlas (mongodb.com/atlas), והעתיקי את כתובת החיבור.
2. העתיקי את `.env.example` לקובץ חדש בשם `.env`, ומלאי את `MONGO_URI` ואת `JWT_SECRET`.
3. בטרמינל:
   ```
   npm install
   npm run seed
   npm run dev
   ```
   `npm run seed` יוצר משתמש מנהל ומנות לדוגמה (מספיק להריץ פעם אחת).

## מבנה

```
src/
  server.js           נקודת הכניסה: הגדרות Express וחיבור הנתיבים
  seed.js             יצירת מנהל ומנות לדוגמה
  config/db.js        חיבור ל-MongoDB
  models/             מבנה הנתונים: User, Dish, Order
  middleware/auth.js  בדיקת התחברות והרשאת מנהל
  routes/             הנתיבים: auth, dishes, orders
  utils/              עזרים לטיפול בשגיאות
```

## התחברות

אחרי login או register השרת מחזיר `token`. בכל בקשה שדורשת התחברות שולחים את הטוקן בכותרת:
```
Authorization: Bearer <token>
```

## נתיבים

| שיטה | נתיב | מי | תיאור |
|---|---|---|---|
| POST | /api/auth/register | כולם | הרשמה (תמיד כלקוח) |
| POST | /api/auth/login | כולם | התחברות |
| GET | /api/auth/me | מחובר | המשתמש המחובר |
| GET | /api/dishes?search=&category=&sort= | כולם | רשימת מנות. sort: name / price / -price / newest |
| GET | /api/dishes/categories | כולם | רשימת הקטגוריות |
| GET | /api/dishes/:id | כולם | מנה אחת |
| POST / PUT / DELETE | /api/dishes/:id | מנהל | הוספה, עריכה, מחיקה |
| GET | /api/orders/options | מחובר | סטטוסים ואמצעי תשלום |
| GET | /api/orders?status=&sort=eventDate | מחובר | לקוח: ההזמנות שלו. מנהל: כולן |
| GET | /api/orders/:id | בעלים או מנהל | הזמנה אחת |
| POST | /api/orders | מחובר | יצירת הזמנה |
| PATCH | /api/orders/:id/cancel | בעלים או מנהל | ביטול (לקוח: רק לפני אישור) |
| PATCH | /api/orders/:id | מנהל | עדכון status, depositPaid, extraItems |
| GET | /api/orders/:id/shopping-list | מנהל | רשימת קניות מחושבת |
| DELETE | /api/orders/:id | מנהל | מחיקת הזמנה |

## דוגמאות גוף בקשה

יצירת הזמנה:
```json
{
  "eventName": "בר מצווה",
  "eventDate": "2026-12-15",
  "guests": 80,
  "address": "ירושלים",
  "notes": "",
  "paymentMethod": "אשראי",
  "items": [{ "dishId": "<id של מנה>", "quantity": 80 }]
}
```
השרת מחשב בעצמו את `total` ואת `deposit` (10% מהסכום).

הוספת פריטי קנייה נוספים (מנהל):
```json
{ "extraItems": [{ "name": "צלחות חד פעמיות", "amount": 100, "unit": "יחידות" }] }
```

הוספת מנה (מנהל):
```json
{
  "name": "קציצות בשר",
  "category": "עיקריות",
  "price": 50,
  "description": "ברוטב עגבניות",
  "image": "https://...",
  "ingredients": [{ "name": "בשר טחון", "amount": 0.2, "unit": "ק\"ג" }]
}
```
