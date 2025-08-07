// Sitemap generator for Billify e-commerce platform
// This file should be run during build to generate sitemap.xml

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = "https://billify.vercel.app";

// Static routes
const staticRoutes = [
  "/",
  "/user/home",
  "/user/products",
  "/user/products?category=men",
  "/user/products?category=women",
  "/user/products?category=kids",
  "/user/products?category=unisex",
  "/user/search",
  "/user/cart",
  "/auth/login",
  "/auth/register",
];

// Generate sitemap XML
function generateSitemap(routes, products = []) {
  const currentDate = new Date().toISOString();

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`;

  // Add static routes
  routes.forEach((route) => {
    const priority = route === "/" || route === "/user/home" ? "1.0" : "0.8";
    const changefreq = route.includes("products") ? "daily" : "weekly";

    sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  });

  // Add product routes
  products.forEach((product) => {
    sitemap += `
  <url>
    <loc>${baseUrl}/user/products/${product.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <image:image>
      <image:loc>${product.image}</image:loc>
      <image:title>${product.title}</image:title>
      <image:caption>${product.description}</image:caption>
    </image:image>
  </url>`;
  });

  sitemap += `
</urlset>`;

  return sitemap;
}

// Generate robots.txt
function generateRobotsTxt() {
  return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Disallow admin routes
Disallow: /admin/
Disallow: /api/
Disallow: /user/cart
Disallow: /user/checkout

# Allow important pages
Allow: /user/home
Allow: /user/products
Allow: /user/search
Allow: /auth/

# Crawl delay
Crawl-delay: 1`;
}

// Write files
function writeSEOFiles() {
  const sitemap = generateSitemap(staticRoutes);
  const robots = generateRobotsTxt();

  // Write to public directory
  const publicDir = path.join(__dirname, "../..", "public");

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap);
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots);

  console.log("✅ SEO files generated successfully!");
  console.log("📄 sitemap.xml created");
  console.log("🤖 robots.txt created");
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  writeSEOFiles();
}

export { generateSitemap, generateRobotsTxt, writeSEOFiles };
