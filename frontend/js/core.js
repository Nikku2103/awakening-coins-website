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
   SMOOTH SCROLL
================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((anchor) => {
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
   CORE BOOTSTRAP
================================ */
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  initSmoothScroll();
});
