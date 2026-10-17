import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.url}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteConfig.url}/marketplace`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
  ];

  return routes;
}
