import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/utils";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The admin area is behind a login, but keeping it out of crawls avoids
      // publishing the URL and the sign-in form alongside the site.
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
