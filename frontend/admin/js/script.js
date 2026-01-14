// Hero Carousel Functionality
document.addEventListener('DOMContentLoaded', function() {
    loadLatestBlogs();
    const heroTrack = document.querySelector('.hero-track');
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroDots = document.querySelectorAll('.hero-dot');
    const prevBtn = document.querySelector('.hero-prev');
    const nextBtn = document.querySelector('.hero-next');
    const heroSlider = document.querySelector('.hero-slider');
    
    let currentSlide = 0;
    const totalSlides = heroSlides.length;
    let autoSlideInterval;
    
    // Function to update carousel position
    function updateCarousel() {
        heroTrack.style.transform = `translateX(-${currentSlide * 100}vw)`;
        
        // Update dots
        heroDots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }
    
    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }
    
    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }
    
    // Go to specific slide
    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
        resetAutoSlide();
    }
    
    // Auto slide functionality
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 3000);
    }
    
    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
    }
    
    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }
    
    // Click to scroll to blog section
    if (heroSlider) {
        heroSlider.addEventListener('click', function(e) {
            // Don't trigger if clicking on navigation buttons or dots
            if (e.target.closest('.hero-prev') || 
                e.target.closest('.hero-next') || 
                e.target.closest('.hero-dot')) {
                return;
            }
            
            const blogSection = document.querySelector('.blog');
            if (blogSection) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const blogPosition = blogSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: blogPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Event listeners for buttons
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Event listeners for dots
    heroDots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToSlide(index));
    });
    
    // Pause auto-slide on hover
    if (heroTrack) {
        heroTrack.addEventListener('mouseenter', stopAutoSlide);
        heroTrack.addEventListener('mouseleave', startAutoSlide);
    }
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    if (heroTrack) {
        heroTrack.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
            stopAutoSlide();
        });
        
        heroTrack.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            startAutoSlide();
        });
    }
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            nextSlide();
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            prevSlide();
        }
    }
    
    // Start auto-slide on page load
    startAutoSlide();
    
    // Initialize
    updateCarousel();
    
    // Load latest blogs from centralized data
    loadLatestBlogs();
});

// Smooth Scrolling for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        
        if (targetId === '#top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

// Form Submission
const consultationForm = document.getElementById('consultationForm');
if (consultationForm) {
    consultationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('Thank you for your request! We will contact you within 24 hours.');
        this.reset();
    });
}

// Newsletter Subscription
const subscribeBtn = document.getElementById('subscribeBtn');
const newsletterEmail = document.getElementById('newsletterEmail');

if (subscribeBtn && newsletterEmail) {
    subscribeBtn.addEventListener('click', function() {
        const email = newsletterEmail.value;
        if (!email || !email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }
        alert('Thank you for subscribing to our newsletter!');
        newsletterEmail.value = '';
    });
}

// Sticky Header Effect
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.padding = '0.5rem 5%';
        header.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
    } else {
        header.style.padding = '0.8rem 5%';
        header.style.boxShadow = '0 2px 15px rgba(0,0,0,0.1)';
    }
});



// Mobile menu toggle
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

const API_BASE = '/api/blogs';

async function loadLatestBlogs() {
  try {
    const res = await fetch(API_BASE);
    const blogs = await res.json();

    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    blogGrid.innerHTML = blogs.slice(0, 3).map((blog, index) => {
      const reverse = index % 2 === 1 ? 'reverse' : '';

      return `
        <div class="blog-card ${reverse}">
          <div class="blog-image" style="background-image:url('${blog.image}')">
            <div class="blog-image-content">
              <div class="blog-category-tag">
                ${blog.category.replace('-', ' ').toUpperCase()}
              </div>
            </div>
          </div>

          <div class="blog-info">
            <div class="blog-info-content">
              <h3>${blog.title}</h3>
              <p class="blog-excerpt">${blog.excerpt}</p>
              <a href="blog-reader.html?id=${blog._id}" class="blog-read-more">
                Read Article →
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');

  } catch (err) {
    console.error('Failed to load blogs', err);
  }
}
