const express = require("express");
const { generateSitemap } = require("../controllers/sitemapController");

const router = express.Router();

router.get("/sitemap.xml", generateSitemap);

module.exports = router;
