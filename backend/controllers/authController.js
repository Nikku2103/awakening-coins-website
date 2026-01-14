const jwt = require("jsonwebtoken");

exports.adminLogin = (req, res) => {
  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.json({ token });
};

// This route is protected by authMiddleware
// If we reach here, the token is valid and user is admin
exports.verifyAdmin = (req, res) => {
  res.json({ valid: true });
};
