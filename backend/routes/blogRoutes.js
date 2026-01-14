const express = require("express");
const {
  getAllBlogs,
  getBlogById,
  getBlogBySlug,
  createBlog,
  updateBlog,
  deleteBlog,
} = require("../controllers/blogController");

const adminAuth = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");

const router = express.Router();

/* =========================
   PUBLIC ROUTES
========================= */
router.get("/", getAllBlogs);
router.get("/slug/:slug", getBlogBySlug);
router.get("/:id", getBlogById);

/* =========================
   ADMIN ROUTES
========================= */
router.post("/", adminAuth, upload.single("image"), createBlog);

router.put("/:id", adminAuth, upload.single("image"), updateBlog);

router.delete("/:id", adminAuth, deleteBlog);

module.exports = router;
