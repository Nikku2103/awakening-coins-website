/* ===============================
   DOM READY
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initHeroCarousel();
  initForms();
  loadLatestBlogsByCategory();
  initAboutToggle();
  initServiceCardRouting();
  initFeatureToggles();
  initTestimonialToggles(); // ✅ ADD THIS
});

const CATEGORY_LABELS = {
  "digital-marketing": "Digital Marketing",
  "website-development": "Website Development",
  "mobile-app-development": "Mobile App Development",
  "video-editing-creatives": "Video Editing & Creatives",
  "e-commerce": "E-Commerce",
};

/* ===============================
   HERO CAROUSEL
================================ */
function initHeroCarousel() {
  const track = document.querySelector(".hero-track");
  const slides = document.querySelectorAll(".hero-slide");
  const prevBtn = document.querySelector(".hero-prev");
  const nextBtn = document.querySelector(".hero-next");
  const dots = document.querySelectorAll(".hero-dot");

  if (!track || slides.length === 0) return;

  let currentIndex = 0;
  let autoplayInterval;

  function updateSlider() {
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === currentIndex);
    });
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlider();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlider();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlider();
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      stopAutoplay();
      startAutoplay();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  startAutoplay();
  track.addEventListener("mouseenter", stopAutoplay);
  track.addEventListener("mouseleave", startAutoplay);
}

/* ===============================
   FORMS
================================ */
function initForms() {
  const contactForm = document.querySelector("#contactForm");
  if (!contactForm) return;

  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    contactForm.reset();
  });
}

/* ===============================
   HOMEPAGE BLOG LOADER (ROBUST)
================================ */
async function loadLatestBlogsByCategory() {
  const container = document.getElementById("latestBlogs");
  if (!container) return;

  try {
    const res = await fetch("/api/blogs");
    if (!res.ok) throw new Error("Failed to fetch blogs");

    const payload = await res.json();

    const blogs = Array.isArray(payload)
      ? payload
      : Array.isArray(payload.blogs)
      ? payload.blogs
      : null;

    if (!blogs) {
      console.error("Invalid blogs payload:", payload);
      return;
    }

    const categories = [
      "digital-marketing",
      "website-development",
      "mobile-app-development",
      "video-editing-creatives",
      "e-commerce",
    ];

    const latestByCategory = {};

    blogs.forEach((blog) => {
      if (!categories.includes(blog.category)) return;

      if (
        !latestByCategory[blog.category] ||
        new Date(blog.createdAt) >
          new Date(latestByCategory[blog.category].createdAt)
      ) {
        latestByCategory[blog.category] = blog;
      }
    });

    container.innerHTML = "";

    Object.values(latestByCategory).forEach((blog, index) => {
      const reverse = index % 2 === 1 ? "reverse" : "";

      const card = document.createElement("div");
      card.className = `blog-card ${reverse}`;

      card.innerHTML = `
        <div class="blog-image" style="background-image:url('${blog.image}')">
          <div class="blog-image-content">
            <div class="blog-category-tag">
              ${CATEGORY_LABELS[blog.category] || blog.category}
            </div>
          </div>
        </div>

        <div class="blog-info">
          <div class="blog-info-content">
            <h3>${blog.title}</h3>
            <p class="blog-excerpt">${blog.excerpt}</p>
            <a
              href="/pages/blogs.html?category=${blog.category}"
              class="blog-read-more"
            >
              View All ${CATEGORY_LABELS[blog.category] || blog.category} Blogs
              <i class="fas fa-arrow-right"></i>
            </a>
          </div>
        </div>
      `;

      container.appendChild(card);
    });
  } catch (err) {
    console.error("Homepage blog load failed:", err);
  }
}

/* ===============================
   ABOUT TOGGLE
================================ */
function initAboutToggle() {
  const aboutText = document.getElementById("aboutText");
  const toggleBtn = document.getElementById("aboutToggle");
  if (!aboutText || !toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    const expanded = aboutText.classList.toggle("expanded");
    toggleBtn.textContent = expanded ? "Read Less" : "Read More";
  });
}

/* ===============================
   SERVICE CARD ROUTING
================================ */
function initServiceCardRouting() {
  document.querySelectorAll(".service-card").forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector("h3")?.textContent.toLowerCase();
      if (!title) return;

      if (title.includes("digital")) {
        window.location.href = "/pages/blogs.html?category=digital-marketing";
      } else if (title.includes("mobile")) {
        window.location.href = "/pages/blogs.html?category=mobile-app-development";
      } else if (title.includes("website")) {
        window.location.href = "/pages/blogs.html?category=website-development";
      }
    });
  });
}

/* ===============================
   FEATURE TOGGLES
================================ */
function initFeatureToggles() {
  document.querySelectorAll(".feature").forEach(feature => {
    const trigger = feature.querySelector(".learn-more");
    if (!trigger) return;

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      feature.classList.toggle("expanded");

      trigger.textContent = feature.classList.contains("expanded")
        ? "Show Less"
        : "Learn More";
    });
  });
}


/* ================================
   TESTIMONIAL TOGGLES - UPDATED
================================ */
function initTestimonialToggles() {
  document.querySelectorAll('.testimonial').forEach(testimonial => {
    const toggleBtn = testimonial.querySelector('.testimonial-toggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Toggle the expanded class
      testimonial.classList.toggle('expanded');

      // Update button text
      toggleBtn.textContent = testimonial.classList.contains('expanded')
        ? 'Show Less'
        : 'Learn More';
    });
  });
}