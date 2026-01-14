module.exports = (err, req, res, next) => {
  const statusCode = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";

  if (statusCode >= 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    message: isProd
      ? statusCode === 500
        ? "Internal Server Error"
        : err.message
      : err.message || "Internal Server Error",
  });
};
