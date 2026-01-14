const API_BASE = "/api/blogs";

function getYouTubeEmbed(url) {
  if (!url) return null;

  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);

  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

async function loadBlog() {
  const id = new URLSearchParams(window.location.search).get("id");
  const container = document.getElementById("blogContentContainer");

  if (!id || !container) return;

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    if (!res.ok) throw new Error("Blog not found");

    const blog = await res.json();

    // DEBUG: Log the blog data
    console.log("Blog data:", blog);
    console.log("Video URL:", blog.videoUrl);

    // HEADER + IMAGE (only show image if no video)
    container.innerHTML = `
      <div class="blog-header">
        <div class="blog-category">
          ${blog.category.replace("-", " ").toUpperCase()}
        </div>

        <h1 class="blog-title">${blog.title}</h1>

        <div class="blog-meta">
          <span>By ${blog.author || "Awakening Coins Team"}</span>
          <span>${new Date(blog.createdAt).toDateString()}</span>
        </div>
      </div>

      ${
        !blog.videoUrl
          ? `
        <div class="blog-image"
             style="background-image:url('${blog.image}')">
        </div>
      `
          : ""
      }
    `;

    // 🎥 VIDEO (ONLY IF PRESENT)
    if (blog.videoUrl) {
      const embedUrl = getYouTubeEmbed(blog.videoUrl);

      // DEBUG: Log embed URL
      console.log("Embed URL:", embedUrl);

      if (embedUrl) {
        const videoWrapper = document.createElement("div");
        videoWrapper.className = "blog-video";
        videoWrapper.innerHTML = `
          <iframe
            src="${embedUrl}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        `;
        container.appendChild(videoWrapper);

        // DEBUG: Confirm video was added
        console.log("Video wrapper added to container");
      } else {
        console.log("Failed to generate embed URL from:", blog.videoUrl);
      }
    } else {
      console.log("No video URL found in blog data");
    }

    // CONTENT
    const content = document.createElement("div");
    content.className = "blog-content";
    content.innerHTML = blog.content;
    container.appendChild(content);

    // SHARE + BACK
    container.insertAdjacentHTML(
      "beforeend",
      `
  <div class="share-buttons">

  <!-- Facebook -->
  <a
    class="share-button share-facebook"
    target="_blank"
    rel="noopener noreferrer"
    href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      location.href
    )}"
    aria-label="Share on Facebook"
  >
    <i class="fab fa-facebook-f"></i>
  </a>

  <!-- Twitter / X -->
  <a
    class="share-button share-twitter"
    target="_blank"
    rel="noopener noreferrer"
    href="https://twitter.com/intent/tweet?url=${encodeURIComponent(
      location.href
    )}&text=${encodeURIComponent(blog.title)}"
    aria-label="Share on Twitter"
  >
    <i class="fab fa-twitter"></i>
  </a>

  <!-- LinkedIn -->
  <a
    class="share-button share-linkedin"
    target="_blank"
    rel="noopener noreferrer"
    href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
      location.href
    )}&title=${encodeURIComponent(blog.title)}"
    aria-label="Share on LinkedIn"
  >
    <i class="fab fa-linkedin-in"></i>
  </a>

  <!-- WhatsApp -->
  <a
    class="share-button share-whatsapp"
    target="_blank"
    rel="noopener noreferrer"
    href="https://api.whatsapp.com/send?text=${encodeURIComponent(
      blog.title + " " + location.href
    )}"
    aria-label="Share on WhatsApp"
  >
    <i class="fab fa-whatsapp"></i>
  </a>

  <!-- Instagram (profile link) -->
  <a
    class="share-button share-instagram"
    target="_blank"
    rel="noopener noreferrer"
    href="https://www.instagram.com/awakeningcoinsnew/"
    aria-label="Visit Instagram"
  >
    <i class="fab fa-instagram"></i>
  </a>

</div>


  <a href="/pages/blogs.html" class="back-button">
    ← Back to Blogs
  </a>
  `
    );

    document.title = `${blog.title} - Awakening Coins`;
  } catch (err) {
    console.error(err);
    container.innerHTML = `
      <div style="text-align:center; padding:3rem;">
        <h2>Blog not found</h2>
        <a href="/pages/blogs.html" class="back-button">Back to Blogs</a>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadBlog);

