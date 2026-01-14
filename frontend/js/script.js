/* ===============================
   DOM READY
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initHeroCarousel();
  initSmoothScroll();
  initForms();
  initMobileMenu();
  loadLatestBlogsByCategory();
});

/* ===============================
   HERO CAROUSEL (DEFENSIVE)
================================ */
function initHeroCarousel() {
  const heroTrack = document.querySelector(".hero-track");
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroDots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.querySelector(".hero-prev");
  const nextBtn = document.querySelector(".hero-next");
  const heroSlider = document.querySelector(".hero-slider");

  // 🚨 CRITICAL GUARD — fixes Issue 2
  if (!heroTrack || heroSlides.length === 0) return;

  let currentSlide = 0;
  const totalSlides = heroSlides.length;
  let autoSlideInterval = null;

  function updateCarousel() {
    heroTrack.style.transform = `translateX(-${currentSlide * 100}vw)`;
    heroDots.forEach((dot, i) =>
      dot.classList.toggle("active", i === currentSlide)
    );
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
  }

  function startAutoSlide() {
    if (totalSlides > 1) {
      autoSlideInterval = setInterval(nextSlide, 3000);
    }
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  if (nextBtn) nextBtn.addEventListener("click", nextSlide);
  if (prevBtn) prevBtn.addEventListener("click", prevSlide);

  heroDots.forEach((dot, i) =>
    dot.addEventListener("click", () => {
      currentSlide = i;
      updateCarousel();
    })
  );

  if (heroSlider) {
    heroSlider.addEventListener("click", (e) => {
      if (
        e.target.closest(".hero-prev") ||
        e.target.closest(".hero-next") ||
        e.target.closest(".hero-dot")
      )
        return;

      const blogSection = document.querySelector(".blog");
      if (!blogSection) return;

      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      window.scrollTo({
        top: blogSection.offsetTop - headerHeight,
        behavior: "smooth",
      });
    });
  }

  heroTrack.addEventListener("mouseenter", stopAutoSlide);
  heroTrack.addEventListener("mouseleave", startAutoSlide);

  let touchStartX = 0;
  let touchEndX = 0;

  heroTrack.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoSlide();
  });

  heroTrack.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
    startAutoSlide();
  });

  updateCarousel();
  startAutoSlide();
}

/* ===============================
   SMOOTH SCROLL
================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      e.preventDefault();
      const id = anchor.getAttribute("href");
      const target = document.querySelector(id);
      if (!target) return;

      const headerHeight = document.querySelector("header")?.offsetHeight || 0;
      window.scrollTo({
        top: target.offsetTop - headerHeight,
        behavior: "smooth",
      });
    });
  });
}

/* ===============================
   FORMS
================================ */
function initForms() {
  const consultationForm = document.getElementById("consultationForm");
  if (consultationForm) {
    consultationForm.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Thank you! We will contact you within 24 hours.");
      consultationForm.reset();
    });
  }

  const subscribeBtn = document.getElementById("subscribeBtn");
  const newsletterEmail = document.getElementById("newsletterEmail");

  if (subscribeBtn && newsletterEmail) {
    subscribeBtn.addEventListener("click", () => {
      if (!newsletterEmail.value.includes("@")) {
        alert("Enter a valid email");
        return;
      }
      alert("Subscribed successfully!");
      newsletterEmail.value = "";
    });
  }
}

/* ===============================
   MOBILE MENU
================================ */
function initMobileMenu() {
  const toggle = document.querySelector(".mobile-menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    toggle.classList.toggle("active");
    nav.classList.toggle("active");
  });

  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      toggle.classList.remove("active");
      nav.classList.remove("active");
    })
  );
}

/* ===============================
   HOMEPAGE BLOGS (CATEGORY-AWARE)
================================ */
async function loadLatestBlogsByCategory() {
  try {
    const res = await fetch("/api/blogs");
    if (!res.ok) throw new Error("Blog fetch failed");

    const blogs = await res.json();

    // Filter only service blogs (not courses)
    const serviceBlogs = blogs.filter((blog) => blog.type === "service");

    // Get the latest blog for each category
    const latest = {
      "digital-marketing": null,
      "web-development": null,
      "mobile-apps": null,
    };

    // Sort blogs to get the latest ones first
    // If your blogs have a createdAt date, use that: new Date(b.createdAt) - new Date(a.createdAt)
    // Otherwise, we'll use the order they come from API (or use _id)
    serviceBlogs.forEach((blog) => {
      if (blog.category in latest && !latest[blog.category]) {
        latest[blog.category] = blog;
      }
    });

    // Update each blog card with real data
    updateBlogCard("digital-marketing", latest["digital-marketing"]);
    updateBlogCard("web-development", latest["web-development"]);
    updateBlogCard("mobile-apps", latest["mobile-apps"]);
  } catch (err) {
    console.error("Homepage blog load failed:", err);
    // If API fails, keep the existing placeholder content
  }
}

function updateBlogCard(category, blog) {
  // Find the blog card for this category
  const blogCards = document.querySelectorAll(".blog-card");
  let targetCard = null;

  blogCards.forEach((card) => {
    const categoryTag = card.querySelector(".blog-category-tag");
    if (
      categoryTag &&
      categoryTag.textContent.toLowerCase().includes(category.replace("-", " "))
    ) {
      targetCard = card;
    }
  });

  if (!targetCard || !blog) return;

  // Update content
  const blogImage = targetCard.querySelector(".blog-image");
  if (blogImage && blog.image) {
    const img = blogImage.querySelector("img");
    if (img && blog.image) {
      img.src = blog.image;
      img.alt = blog.title || "Blog image";
    }
  }

  const categoryTag = targetCard.querySelector(".blog-category-tag");
  if (categoryTag) {
    const displayName = {
      "digital-marketing": "Digital Marketing",
      "web-development": "Web Development",
      "mobile-apps": "Mobile Apps",
    };
    categoryTag.textContent =
      displayName[category] || category.replace("-", " ").toUpperCase();
  }

  const title = targetCard.querySelector("h3");
  if (title && blog.title) {
    title.textContent = blog.title;
  }

  const excerpt = targetCard.querySelector(".blog-excerpt");
  if (excerpt && blog.excerpt) {
    // 🔥 SIMPLE FIX: Trim the excerpt to a safe length
    const maxChars = 120; // Adjust as needed
    let excerptText = blog.excerpt;

    if (excerptText.length > maxChars) {
      excerptText = excerptText.substring(0, maxChars) + "...";
    }

    excerpt.textContent = excerptText;

    // 🔥 Force line clamping
    excerpt.style.display = "-webkit-box";
    excerpt.style.webkitBoxOrient = "vertical";
    excerpt.style.webkitLineClamp = "3";
    excerpt.style.overflow = "hidden";
  }

  const readMoreLink = targetCard.querySelector(".blog-read-more");
  if (readMoreLink && blog._id) {
    readMoreLink.href = `/pages/blog-reader.html?id=${blog._id}`;
  }
}
