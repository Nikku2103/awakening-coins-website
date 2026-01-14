const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const compression = require('compression');


const connectDB = require('./config/db');
const blogRoutes = require('./routes/blogRoutes');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const sitemapRoutes = require("./routes/sitemapRoutes");


const app = express();

// DB
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ Database connection failed");
    process.exit(1);
  }
})();


// Middleware
app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use(compression());

app.get("/pages/blog-reader.html", async (req, res, next) => {
  const { id, slug } = req.query;

  if (slug) return next();

  if (id) {
    try {
      const Blog = require("./models/Blog");
      const blog = await Blog.findById(id);
      if (blog?.slug) {
        return res.redirect(
          301,
          `/pages/blog-reader.html?slug=${blog.slug}`
        );
      }
    } catch (e) {}
  }

  next();
});

app.use("/", sitemapRoutes);



// 🌍 Serve frontend
app.use(
  express.static(path.join(__dirname, '../frontend'), {
    maxAge: '7d',
    etag: true
  })
);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 🔐 Auth routes
app.use('/api/auth', authRoutes);

// 🧠 Blog API
app.use('/api/blogs', blogRoutes);

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get('/', (req, res) => {
  res.sendFile(
    path.join(__dirname, '../frontend/pages/index.html')
  );
});


// Global error handler (LAST)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
