import React from "react";
import SEOHead from "./SEOHead";

const ProductSEO = ({ product, category }) => {
  if (!product) return null;

  const title = `${product.title} - ${product.brand || "Billify"} | Premium ${
    category || "Fashion"
  } Online`;
  const description = `${
    product.description || `Shop ${product.title} at Billify.`
  } Premium quality ${
    category || "fashion"
  } with fast shipping and secure checkout. Best prices guaranteed.`;
  const keywords = `${product.title}, ${product.brand || ""}, ${
    category || "fashion"
  }, billify, ecommerce, online shopping, ${
    product.category || ""
  }, buy online, premium quality`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: product.brand || "Billify",
    },
    category: product.category,
    image: product.image,
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

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={`/user/products/${product._id}`}
      image={product.image}
      type="product"
      structuredData={structuredData}
    />
  );
};

export default ProductSEO;
