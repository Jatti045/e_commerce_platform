// SEO utilities for Billify e-commerce platform

/**
 * Generate structured data for a product
 */
export const generateProductStructuredData = (product) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.image,
    brand: {
      "@type": "Brand",
      name: product.brand || "Billify",
    },
    category: product.category,
    sku: product._id,
    offers: {
      "@type": "Offer",
      price: product.salePrice || product.price,
      priceCurrency: "USD",
      availability:
        product.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Billify",
        url: "https://billify.vercel.app",
      },
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: product.rating,
          reviewCount: product.reviewCount || 1,
        }
      : undefined,
  };
};

/**
 * Generate SEO-friendly URLs
 */
export const generateSEOUrl = (product) => {
  const slug = product.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  return `/user/products/${product._id}/${slug}`;
};

/**
 * Generate meta description for products
 */
export const generateProductMetaDescription = (product) => {
  const price = product.salePrice || product.price;
  const brand = product.brand || "Billify";
  return `Shop ${product.title} by ${brand} for $${price} at Billify. ${
    product.description?.substring(0, 100) || "Premium quality product"
  } with fast shipping and secure checkout.`;
};

/**
 * Generate keywords for products
 */
export const generateProductKeywords = (product) => {
  const baseKeywords = ["billify", "ecommerce", "online shopping", "vercel"];
  const productKeywords = [
    product.title,
    product.brand,
    product.category,
    product.type,
    "buy online",
    "premium quality",
    "fast shipping",
  ].filter(Boolean);

  return [...baseKeywords, ...productKeywords].join(", ");
};

/**
 * Generate breadcrumb structured data
 */
export const generateBreadcrumbStructuredData = (items) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};

/**
 * Generate organization structured data
 */
export const generateOrganizationStructuredData = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Billify",
    url: "https://billify.vercel.app",
    logo: "https://billify.vercel.app/rabbit-logo.png",
    description:
      "Premium E-commerce Platform for quality fashion and lifestyle products",
    sameAs: ["https://vercel.com"],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      areaServed: "US",
      availableLanguage: "English",
    },
  };
};

/**
 * Category-specific SEO data
 */
export const categoryData = {
  men: {
    title: "Men's Fashion",
    description:
      "Discover our premium men's fashion collection at Billify. Shop the latest trends in men's clothing, shoes, and accessories with fast shipping and secure checkout.",
    keywords:
      "men fashion, men clothing, men shoes, men accessories, billify men, ecommerce men, online men shopping, premium men collection",
  },
  women: {
    title: "Women's Fashion",
    description:
      "Explore our stunning women's fashion collection at Billify. Find trendy women's clothing, shoes, and accessories with quality guaranteed and fast delivery.",
    keywords:
      "women fashion, women clothing, women shoes, women accessories, billify women, ecommerce women, online women shopping, premium women collection",
  },
  kids: {
    title: "Kids' Clothing",
    description:
      "Shop our adorable kids' clothing collection at Billify. Quality children's fashion, comfortable and stylish clothes for boys and girls of all ages.",
    keywords:
      "kids clothing, children fashion, boys clothing, girls clothing, billify kids, ecommerce kids, online kids shopping, children clothes",
  },
  unisex: {
    title: "Unisex Fashion",
    description:
      "Browse our versatile unisex fashion collection at Billify. Gender-neutral clothing and accessories perfect for everyone with premium quality and modern style.",
    keywords:
      "unisex fashion, gender neutral clothing, unisex accessories, billify unisex, ecommerce unisex, online unisex shopping, versatile fashion",
  },
};
