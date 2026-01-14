/* =========================
   BLOGS PAGE SCRIPT (CLEAN)
========================= */

const API_BASE = "/api/blogs";

/* =========================
   CATEGORY DEFINITIONS
========================= */

const CATEGORY_LABELS = {
  "digital-marketing": "Digital Marketing",
  "website-development": "Website Development",
  "mobile-app-development": "Mobile App Development",
  "video-editing-creatives": "Video Editing & Creatives",
  "e-commerce": "E-Commerce",
};

const SERVICE_CATEGORIES = {
  "digital-marketing": "Digital Marketing",
  "website-development": "Website Development",
  "mobile-app-development": "Mobile App Development",
  "video-editing-creatives": "Video Editing & Creatives",
};

const PRODUCT_CATEGORIES = {
  "digital-marketing": "Digital Marketing",
  "website-development": "Website Development",
  "mobile-app-development": "Mobile App Development",
  "e-commerce": "E-Commerce",
};

/* =========================
   STATE
========================= */

let blogs = [];
let activeTab = "service"; // service | product
let activeCategory = "all";

const params = new URLSearchParams(window.location.search);
const initialCategory = params.get("category");
let urlCategoryApplied = false;

/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  if (initialCategory === "e-commerce") {
    activeTab = "product";
  } else if (initialCategory) {
    activeTab = "service";
  }

  bindTabEvents();
  loadBlogs();
});

/* =========================
   DATA FETCH
========================= */

async function loadBlogs() {
  try {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to load blogs");

    const data = await res.json();

    // ✅ unwrap backend response properly
    blogs = Array.isArray(data) ? data : data.blogs || [];

    renderAll();
  } catch (err) {
    console.error(err);
    blogs = [];
    renderAll();
  }
}

/* =========================
   RENDER
========================= */

function renderAll() {
  renderTabs();
  renderCategoryFilters();
  renderBlogs();
}

/* =========================
   TABS
========================= */

function renderTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeTab);
  });

  document.querySelectorAll(".blogs-content").forEach((section) => {
    section.classList.toggle("active", section.id === `${activeTab}-blogs`);
  });
}

function setTab(tab) {
  activeTab = tab;
  activeCategory = "all";
  renderAll();
}

/* =========================
   CATEGORY FILTERS
========================= */

function renderCategoryFilters() {
  if (
    !urlCategoryApplied &&
    initialCategory &&
    (SERVICE_CATEGORIES[initialCategory] || PRODUCT_CATEGORIES[initialCategory])
  ) {
    activeCategory = initialCategory;
    urlCategoryApplied = true;
  }

  const serviceContainer = document.getElementById("service-categories");
  const productContainer = document.getElementById("product-categories");

  serviceContainer.innerHTML = buildCategoryButtons(
    "All Services",
    SERVICE_CATEGORIES
  );

  productContainer.innerHTML = buildCategoryButtons(
    "All Products",
    PRODUCT_CATEGORIES
  );

  bindCategoryEvents();
}

function buildCategoryButtons(allLabel, categories) {
  return `
    <button class="category-btn ${activeCategory === "all" ? "active" : ""}"
      data-category="all">
      ${allLabel}
    </button>
    ${Object.entries(categories)
      .map(
        ([value, label]) => `
        <button class="category-btn ${activeCategory === value ? "active" : ""}"
          data-category="${value}">
          ${label}
        </button>
      `
      )
      .join("")}
  `;
}

function bindCategoryEvents() {
  document.querySelectorAll(".category-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      setCategory(btn.dataset.category || "all");
    });
  });
}

function setCategory(category) {
  activeCategory = category;
  renderAll();
}

/* =========================
   BLOG RENDERING
========================= */

function renderBlogs() {
  const grid = document.getElementById(`${activeTab}-blogs-grid`);
  if (!grid) return;

  const filtered = blogs.filter((blog) => {
    if (blog.type !== activeTab) return false;
    if (activeCategory !== "all" && blog.category !== activeCategory)
      return false;
    return true;
  });

  grid.innerHTML = filtered.length
    ? filtered.map(renderBlogCard).join("")
    : `<p class="empty-state">No blogs found.</p>`;
}

function renderBlogCard(blog) {
  const categoryLabel = CATEGORY_LABELS[blog.category] || blog.category;

  const typeLabel = blog.type === "product" ? "Product" : "Service";

  return `
    <article class="blog-card">
      <div class="blog-image"
        style="background-image: url('${blog.image || ""}')">
        <div class="blog-badges">
          <span class="blog-type-badge ${blog.type}">
            ${typeLabel}
          </span>
          <span class="blog-category-badge">
            ${categoryLabel}
          </span>
        </div>
      </div>

      <div class="blog-content">
        <h3 class="blog-title">${blog.title}</h3>

        <p class="blog-excerpt">
          ${blog.excerpt || ""}
        </p>

        ${
          blog.type === "product" && blog.courseData
            ? `
              <div class="course-info">
                <div class="course-price">
                  ₹${blog.courseData.price}
                </div>
                <div class="course-details">
                  <span>${blog.courseData.duration}</span>
                  <span>${blog.courseData.level}</span>
                </div>
              </div>
            `
            : ""
        }

        <div class="blog-actions">
          <a href="/pages/blog-reader.html?slug=${blog.slug}"

            class="read-more-btn">
            Read More →
          </a>
        </div>
      </div>
    </article>
  `;
}

function bindTabEvents() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (!tab) return;
      setTab(tab);
    });
  });
}
