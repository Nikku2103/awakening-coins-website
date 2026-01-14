const API_BASE = "/api/blogs";

function getYouTubeEmbed(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

async function loadBlog() {
    // 🔒 Ensure schema tag exists (SEO-critical)
  let schemaTag = document.getElementById("blog-schema");
  if (!schemaTag) {
    schemaTag = document.createElement("script");
    schemaTag.type = "application/ld+json";
    schemaTag.id = "blog-schema";
    document.head.appendChild(schemaTag);
  }

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const container = document.getElementById("blogContentContainer");

  if (!slug || !container) return;

  try {
    const res = await fetch(`${API_BASE}/slug/${slug}`);
    if (!res.ok) throw new Error("Blog not found");

    const blog = await res.json();

    // 🔗 CANONICAL
    const canonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
      canonical.setAttribute(
        "href",
        `https://awakeningcoins.com/blogs/${blog.slug}`
      );
    }

    // 🧠 SEO META
    document.title = blog.metaTitle || blog.title;

    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        blog.metaDescription || blog.excerpt
      );
    }

    // 🧾 SCHEMA
    const schema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      image: blog.image ? [blog.image] : undefined,
      author: {
        "@type": "Organization",
        name: blog.author || "Awakening Coins",
      },
      publisher: {
        "@type": "Organization",
        name: "Awakening Coins",
        logo: {
          "@type": "ImageObject",
          url: "https://awakeningcoins.com/assets/images/logo.svg",
        },
      },
      datePublished: blog.createdAt,
      dateModified: blog.updatedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": window.location.href,
      },
    };

    schemaTag.textContent = JSON.stringify(schema, null, 2);


    // 🧱 CONTENT RENDER
    container.innerHTML = `
      <div class="blog-header">
        <div class="blog-category">
          ${blog.category.replace(/-/g, " ").toUpperCase()}
        </div>

        <h1 class="blog-title">${blog.title}</h1>

        <div class="blog-meta">
          <span>By ${blog.author || "Awakening Coins Team"}</span>
          <span>${new Date(blog.createdAt).toDateString()}</span>
        </div>
      </div>
    `;

    if (blog.videoUrl) {
      const embedUrl = getYouTubeEmbed(blog.videoUrl);
      if (embedUrl) {
        container.insertAdjacentHTML(
          "beforeend",
          `
          <div class="blog-video">
            <iframe
              src="${embedUrl}"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        `
        );
      }
    } else if (blog.image) {
      container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="blog-image"
             style="background-image:url('${blog.image}')">
        </div>
      `
      );
    }

    const content = document.createElement("div");
    content.className = "blog-content";
    content.innerHTML = blog.content;
    container.appendChild(content);

    // 🔁 FALLBACK INTERNAL LINK
    const fallback = document.querySelector(".blog-fallback-links");
    if (fallback) fallback.style.display = "block";

    container.insertAdjacentHTML(
      "beforeend",
      `
      <a href="/pages/blogs.html" class="back-button">
        ← Back to Blogs
      </a>
    `
    );
  } catch (err) {
    container.innerHTML = `
      <div style="text-align:center; padding:3rem;">
        <h2>Blog not found</h2>
        <a href="/pages/blogs.html" class="back-button">Back to Blogs</a>
      </div>
    `;
  }
}

document.addEventListener("DOMContentLoaded", loadBlog);
