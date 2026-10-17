import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/marketplace", "/marketplace/*"],
        disallow: [
          "/api/*",
          "/dashboard/*",
          "/supplier/*",
          "/products/*",
          "/kyb",
          "/admin/*",
          "/login",
          "/register",
          "/orders/*",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
