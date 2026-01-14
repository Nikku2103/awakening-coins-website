const Blog = require("../models/Blog");

exports.generateSitemap = async (req, res) => {
  try {
    const blogs = await Blog.find({ slug: { $exists: true } })
      .select("slug updatedAt")
      .lean();

    res.header("Content-Type", "application/xml");

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Homepage
    xml += `
  <url>
    <loc>https://awakeningcoins.com/</loc>
    <priority>1.0</priority>
  </url>`;

    // Blogs hub
    xml += `
  <url>
    <loc>https://awakeningcoins.com/blogs</loc>
    <priority>0.9</priority>
  </url>`;

    // Blog posts
    blogs.forEach(blog => {
      xml += `
  <url>
    <loc>https://awakeningcoins.com/blogs/${blog.slug}</loc>
    <lastmod>${new Date(blog.updatedAt).toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.status(200).send(xml);
  } catch (err) {
    console.error("Sitemap generation error:", err);
    res.status(500).send("Sitemap error");
  }
};
