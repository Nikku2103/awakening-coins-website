const ADMIN_TOKEN = sessionStorage.getItem("ADMIN_TOKEN");
let selectedImageFile = null;

const FILTER_CATEGORIES = {
  product: [
    "digital-marketing",
    "website-development",
    "mobile-app-development",
    "e-commerce",
  ],
  service: [
    "digital-marketing",
    "website-development",
    "mobile-app-development",
    "video-editing-creatives",
  ],
};

/* =========================
   AUTH CHECK
========================= */
async function verifyAdmin() {
  if (!ADMIN_TOKEN) {
    window.location.href = "/admin/login.html";
    return;
  }

  const res = await fetch("/api/auth/verify", {
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  if (!res.ok) {
    sessionStorage.removeItem("ADMIN_TOKEN");
    window.location.href = "/admin/login.html";
  }
}
verifyAdmin();

/* =========================
   CONSTANTS & ELEMENTS
========================= */
const API_BASE = "/api/blogs";

const filterType = document.getElementById("filterType");
const filterCategory = document.getElementById("filterCategory");

const blogForm = document.getElementById("blogUploadForm");
const blogType = document.getElementById("blogType");
const blogTitle = document.getElementById("blogTitle");
const blogCategory = document.getElementById("blogCategory");
const blogExcerpt = document.getElementById("blogExcerpt");
const blogAuthor = document.getElementById("blogAuthor");
const blogVideo = document.getElementById("blogVideo");

const blogImageFile = document.getElementById("blogImageFile");
const blogImageUrl = document.getElementById("blogImageUrl");

const courseFields = document.getElementById("courseFields");
const coursePrice = document.getElementById("coursePrice");
const courseDuration = document.getElementById("courseDuration");
const courseLevel = document.getElementById("courseLevel");
const whatsappLink = document.getElementById("whatsappLink");

const blogList = document.getElementById("blogList");
const metaTitle = document.getElementById("metaTitle");
const metaDescription = document.getElementById("metaDescription");

/* =========================
   TINYMCE INIT
========================= */
tinymce.init({
  selector: "#blogContent",
  height: 420,
  menubar: false,
  plugins: ["lists", "link", "autolink", "paste", "wordcount"],
  toolbar: `
    undo redo |
    blocks |
    bold italic underline |
    fontsizeselect |
    bullist numlist |
    link |
    removeformat
  `,
  block_formats: "Paragraph=p; Heading 2=h2; Heading 3=h3",
  fontsize_formats: "14px 16px 18px 20px 24px 28px",
  forced_root_block: "p",
  paste_as_text: true,
  content_style: `
    body {
      font-family: inherit;
      font-size: 16px;
      line-height: 1.8;
    }
    h2 {
      font-size: 2rem;
      margin: 2rem 0 1rem;
    }
    h3 {
      font-size: 1.5rem;
      margin: 1.5rem 0 0.75rem;
    }
    p {
      margin: 0 0 1rem;
    }
  `,
  setup: (editor) => {
    editor.on("keyup change SetContent", () => {
      updatePreview();
    });
  },
});

filterCategoriesByType();
toggleCourseFields();

/* =========================
   COURSE FIELD TOGGLE
========================= */
blogType.addEventListener("change", () => {
  toggleCourseFields();
  filterCategoriesByType();
});

function toggleCourseFields() {
  const isProduct = blogType.value === "product";
  courseFields.classList.toggle("hidden", !isProduct);

  coursePrice.required = isProduct;
  courseDuration.required = isProduct;
  courseLevel.required = isProduct;
  whatsappLink.required = isProduct;

  updatePreview();
}

function filterCategoriesByType() {
  const isProduct = blogType.value === "product";

  [...blogCategory.options].forEach((option) => {
    if (!option.value) return;

    if (option.value === "e-commerce") {
      option.hidden = !isProduct;
      return;
    }

    if (option.value === "video-editing-creatives") {
      option.hidden = isProduct;
      return;
    }

    option.hidden = false;
  });

  if (blogCategory.options[blogCategory.selectedIndex]?.hidden) {
    blogCategory.value = "";
  }
}

/* =========================
   FORM SUBMIT (COMPLETELY FIXED)
========================= */
blogForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const contentHtml = tinymce.get("blogContent").getContent();

  if (!contentHtml.trim()) {
    alert("Blog content cannot be empty.");
    return;
  }

  // VALIDATION: Image is required
  const hasImageFile = !!selectedImageFile;
  const hasImageUrl = !!blogImageUrl.value.trim();

  if (!hasImageFile && !hasImageUrl) {
    alert(
      EDITING_BLOG_ID
        ? "You must re-upload the image when editing a blog."
        : "Image is required."
    );
    return;
  }

  // Build FormData
  const formData = new FormData();
  formData.append("title", blogTitle.value.trim());
  formData.append("type", blogType.value);
  formData.append("category", blogCategory.value);
  formData.append("excerpt", blogExcerpt.value.trim());
  formData.append("content", contentHtml);
  formData.append("author", blogAuthor.value.trim() || "Awakening Coins Team");

  if (metaTitle.value.trim()) {
    formData.append("metaTitle", metaTitle.value.trim());
  }

  if (metaDescription.value.trim()) {
    formData.append("metaDescription", metaDescription.value.trim());
  }

  // Add course data for products
  if (blogType.value === "product") {
    formData.append(
      "courseData",
      JSON.stringify({
        price: parseFloat(coursePrice.value),
        duration: courseDuration.value.trim(),
        level: courseLevel.value,
        whatsappLink: whatsappLink.value.trim(),
      })
    );
  }

  // CRITICAL: Append image (file takes precedence over URL)
  if (selectedImageFile) {
    formData.append("image", selectedImageFile);
    console.log("✅ Image file attached:", selectedImageFile.name);
  } else if (hasImageUrl) {
    formData.append("imageUrl", blogImageUrl.value.trim());
    console.log("✅ Image URL attached:", blogImageUrl.value.trim());
  }

  // OPTIONAL: Append video URL
  const videoUrlValue = blogVideo.value.trim();
  if (videoUrlValue) {
    formData.append("videoUrl", videoUrlValue);
    console.log("✅ Video URL attached:", videoUrlValue);
  }

  // Debug: Log all FormData entries
  console.log("📦 FormData contents:");
  for (let pair of formData.entries()) {
    if (pair[1] instanceof File) {
      console.log(`  ${pair[0]}: [File] ${pair[1].name}`);
    } else {
      console.log(`  ${pair[0]}: ${pair[1]}`);
    }
  }

  try {
    const url = EDITING_BLOG_ID ? `${API_BASE}/${EDITING_BLOG_ID}` : API_BASE;
    const method = EDITING_BLOG_ID ? "PUT" : "POST";

    console.log(`🚀 Sending ${method} request to ${url}`);

    const res = await fetch(url, {
      method,
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Server error:", data);
      alert(data.message || "Failed to publish blog");
      return;
    }

    console.log("✅ Blog published successfully:", data);
    alert("Blog published successfully!");

    // Reset form
    blogForm.reset();
    selectedImageFile = null;
    tinymce.get("blogContent").setContent("");
    EDITING_BLOG_ID = null;
    toggleCourseFields();
    updatePreview();
    loadBlogs();
  } catch (err) {
    console.error("❌ Network error:", err);
    alert("Error publishing blog: " + err.message);
  }
});

/* =========================
   PREVIEW LOGIC
========================= */
let previewImageURL = null;

function updatePreview() {
  const frame = document.getElementById("blogPreviewFrame");
  if (!frame || !tinymce.get("blogContent")) return;

  const title = blogTitle.value || "Blog Title";
  const author = blogAuthor.value || "Awakening Coins Team";
  const content =
    tinymce.get("blogContent").getContent() ||
    "<p>Blog content will appear here...</p>";

  let mediaHTML = "";

  // VIDEO OVERRIDES IMAGE IN PREVIEW
  if (blogVideo.value.trim()) {
    const embed = blogVideo.value.trim().replace("watch?v=", "embed/");
    mediaHTML = `
      <div class="video-wrapper">
        <iframe
          src="${embed}"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    `;
  } else if (selectedImageFile) {
    if (previewImageURL) {
      URL.revokeObjectURL(previewImageURL);
    }
    previewImageURL = URL.createObjectURL(selectedImageFile);
    mediaHTML = `<img src="${previewImageURL}" style="max-width:100%;border-radius:12px;margin:20px 0;">`;
  } else if (blogImageUrl.value.trim()) {
    mediaHTML = `<img src="${blogImageUrl.value.trim()}" style="max-width:100%;border-radius:12px;margin:20px 0;">`;
  }

  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="/css/style.css">
        <link rel="stylesheet" href="/css/blog-reader.css">
      </head>
      <body>
        <article class="blog-reader">
          <h1>${title}</h1>
          ${mediaHTML}
          <p><em>By ${author}</em></p>
          <div class="blog-content">
            ${content}
          </div>
        </article>
      </body>
    </html>
  `);
  doc.close();
}

/* =========================
   LOAD BLOGS
========================= */
let EDITING_BLOG_ID = null;

async function loadBlogs() {
  const res = await fetch(API_BASE);
  if (!res.ok) return;

  const data = await res.json();
  let blogs = Array.isArray(data) ? data : data.blogs;

  const typeVal = filterType?.value || "all";
  const categoryVal = filterCategory?.value || "all";

  blogs = blogs.filter((blog) => {
    if (typeVal !== "all" && blog.type !== typeVal) return false;
    if (categoryVal !== "all" && blog.category !== categoryVal) return false;
    return true;
  });

  blogList.innerHTML = blogs.length ? "" : "<p>No blogs found.</p>";

  blogs.forEach((blog) => {
    const item = document.createElement("div");
    item.className = "blog-item";
    item.innerHTML = `
      <div class="blog-item-info">
        <h4>${blog.title}</h4>
        <p style="color:#666;font-size:0.9rem">
          ${new Date(blog.createdAt).toDateString()}
        </p>
      </div>
      <div class="blog-item-actions">
        <button class="btn btn-small">Edit</button>
        <button class="btn btn-danger btn-small">Delete</button>
      </div>
    `;
    item.querySelector(".btn-small").onclick = () => startEdit(blog);
    item.querySelector(".btn-danger").onclick = () => deleteBlog(blog._id);
    blogList.appendChild(item);
  });
}

/* =========================
   EDIT MODE
========================= */
function startEdit(blog) {
  EDITING_BLOG_ID = blog._id;

  blogType.value = blog.type;
  filterCategoriesByType();
  blogCategory.value = blog.category;
  toggleCourseFields();

  blogTitle.value = blog.title;
  blogExcerpt.value = blog.excerpt;
  blogAuthor.value = blog.author || "";
  blogVideo.value = blog.videoUrl || "";

  blogImageUrl.value = blog.image || "";
  selectedImageFile = null;
  metaTitle.value = blog.metaTitle || "";
metaDescription.value = blog.metaDescription || "";


  tinymce.get("blogContent").setContent(blog.content || "");

  if (blog.type === "product" && blog.courseData) {
    coursePrice.value = blog.courseData.price;
    courseDuration.value = blog.courseData.duration;
    courseLevel.value = blog.courseData.level;
    whatsappLink.value = blog.courseData.whatsappLink;
  }

  updatePreview();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   DELETE BLOG
========================= */
async function deleteBlog(id) {
  if (!confirm("Delete this blog permanently?")) return;

  await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
  });

  loadBlogs();
}

/* =========================
   LIVE PREVIEW TRIGGERS
========================= */
[
  blogTitle,
  blogCategory,
  blogExcerpt,
  blogVideo,
  coursePrice,
  courseDuration,
].forEach((el) => el.addEventListener("input", updatePreview));

blogImageUrl.addEventListener("input", updatePreview);

// CRITICAL: Update selectedImageFile when file is chosen
blogImageFile.addEventListener("change", (e) => {
  selectedImageFile = e.target.files[0] || null;
  console.log("📎 Image file selected:", selectedImageFile?.name || "none");
  updatePreview();
});

updateFilterCategories("all");
loadBlogs();

function updateFilterCategories(type) {
  filterCategory.innerHTML = `<option value="all">All Categories</option>`;

  if (type === "all") return;

  FILTER_CATEGORIES[type].forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat.replace(/-/g, " ");
    filterCategory.appendChild(opt);
  });
}

filterType.addEventListener("change", () => {
  updateFilterCategories(filterType.value);
  loadBlogs();
});

filterCategory.addEventListener("change", loadBlogs);
