import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/portal", "/auth"],
    },
    sitemap: "https://www.theaccountingroom.org/sitemap.xml",
  };
}
