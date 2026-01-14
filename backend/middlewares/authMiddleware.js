const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7).trim(); // safer than split

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user for downstream use
    req.user = decoded;

    // Keep current behavior: admin-only
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    next();
  } catch (err) {
    // Log only in dev
    if (process.env.NODE_ENV !== "production") {
      console.error("JWT error:", err.message);
    }

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};
