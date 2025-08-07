import React from "react";
import SEOHead from "./SEOHead";

const CategorySEO = ({ category, products = [] }) => {
  const categoryTitles = {
    men: "Men's Fashion",
    women: "Women's Fashion",
    kids: "Kids' Clothing",
    unisex: "Unisex Fashion",
  };

  const categoryTitle = categoryTitles[category] || "Fashion";
  const title = `${categoryTitle} - Premium ${category} Collection | Billify E-commerce`;
  const description = `Discover our premium ${categoryTitle.toLowerCase()} collection at Billify. Shop the latest trends, quality ${category} clothing and accessories with fast shipping and secure checkout.`;
  const keywords = `${category} fashion, ${category} clothing, billify ${category}, ecommerce ${category}, online ${category} shopping, premium ${category} collection, ${category} accessories, vercel ecommerce`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryTitle} Collection`,
    description: description,
    url: `${
      typeof window !== "undefined" ? window.location.origin : ""
    }/user/products?category=${category}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.title,
          description: product.description,
          image: product.image,
          offers: {
            "@type": "Offer",
            price: product.salePrice || product.price,
            priceCurrency: "USD",
          },
        },
      })),
    },
  };

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      canonicalUrl={`/user/products?category=${category}`}
      type="website"
      structuredData={structuredData}
    />
  );
};

export default CategorySEO;
