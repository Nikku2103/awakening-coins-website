const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    metaTitle: {
      type: String,
      maxlength: 70,
    },

    metaDescription: {
      type: String,
      maxlength: 160,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["service", "product"],
      required: true,
      default: "service",
    },

    category: {
      type: String,
      required: true,
      enum: [
        "digital-marketing",
        "website-development",
        "mobile-app-development",
        "video-editing-creatives",
        "e-commerce",
      ],
    },

    image: {
      type: String,
      default: undefined, // optional (video-only blogs allowed)
    },

    videoUrl: {
      type: String,
      default: undefined,
    },

    excerpt: {
      type: String,
      required: true,
      maxlength: 300, // matches admin UI
    },

    content: {
      type: String,
      required: true,
    },

    author: {
      type: String,
      default: "Awakening Coins Team",
    },

    // Product-only fields
    courseData: {
      price: {
        type: Number,
        required: function () {
          return this.type === "product";
        },
      },
      duration: {
        type: String,
        required: function () {
          return this.type === "product";
        },
      },
      level: {
        type: String,
        enum: ["beginner", "intermediate", "advanced"],
        required: function () {
          return this.type === "product";
        },
      },
      whatsappLink: {
        type: String,
        required: function () {
          return this.type === "product";
        },
      },
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES (SAFE & USEFUL)
========================= */
blogSchema.index({ createdAt: -1 });
blogSchema.index({ type: 1, category: 1 });

blogSchema.pre("validate", function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, "")
      .trim()
      .split(" ")
      .slice(0, 6)
      .join("-");
  }

  if (!this.metaTitle) {
    this.metaTitle = this.title;
  }

  if (!this.metaDescription) {
    this.metaDescription = this.excerpt;
  }
});



module.exports = mongoose.model("Blog", blogSchema);
