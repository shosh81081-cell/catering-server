// עוטף פונקציה אסינכרונית כך ששגיאות יעברו למטפל השגיאות המרכזי
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// יצירת שגיאה עם קוד סטטוס
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}
