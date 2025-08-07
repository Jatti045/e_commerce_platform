import React, { useEffect } from "react";

const SEOHead = ({
  title = "Billify - Premium E-commerce Platform | Shop Online",
  description = "Billify is your premier destination for online shopping. Discover quality products for men, women, kids, and unisex categories. Fast shipping, secure payments, and exceptional customer service.",
  keywords = "billify, ecommerce, online shopping, vercel, fashion, clothing, men fashion, women fashion, kids clothing, unisex clothing, premium products, secure shopping, fast delivery",
  canonicalUrl = "",
  image = "/rabbit-logo.png",
  type = "website",
  author = "Billify Team",
  robots = "index, follow",
  structuredData = null,
}) => {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://billify.vercel.app";
  const fullUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : siteUrl;
  const fullImageUrl = image.startsWith("http") ? image : `${siteUrl}${image}`;

  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Billify",
    description: description,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/user/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    sameAs: ["https://vercel.com"],
  };

  useEffect(() => {
    // Update document title
    document.title = title;

    // Function to update or create meta tag
    const updateMetaTag = (name, content, property = false) => {
      const selector = property
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);

      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Function to update or create link tag
    const updateLinkTag = (rel, href) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", rel);
        document.head.appendChild(link);
      }
      link.setAttribute("href", href);
    };

    // Update basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("author", author);
    updateMetaTag("robots", robots);

    // Update Open Graph meta tags
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:url", fullUrl, true);
    updateMetaTag("og:image", fullImageUrl, true);
    updateMetaTag(
      "og:image:alt",
      "Billify - Premium E-commerce Platform",
      true
    );
    updateMetaTag("og:site_name", "Billify", true);
    updateMetaTag("og:locale", "en_US", true);

    // Update Twitter Card meta tags
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", fullImageUrl);
    updateMetaTag("twitter:image:alt", "Billify - Premium E-commerce Platform");

    // Update canonical URL
    updateLinkTag("canonical", fullUrl);

    // Update structured data
    let structuredDataScript = document.querySelector("#structured-data");
    if (!structuredDataScript) {
      structuredDataScript = document.createElement("script");
      structuredDataScript.type = "application/ld+json";
      structuredDataScript.id = "structured-data";
      document.head.appendChild(structuredDataScript);
    }
    structuredDataScript.textContent = JSON.stringify(
      structuredData || defaultStructuredData
    );

    // Cleanup function
    return () => {
      // Optionally clean up when component unmounts
      // For SEO, we usually want to keep the meta tags
    };
  }, [
    title,
    description,
    keywords,
    author,
    robots,
    fullUrl,
    fullImageUrl,
    type,
    structuredData,
    defaultStructuredData,
  ]);

  // This component doesn't render anything visible
  return null;
};

export default SEOHead;
