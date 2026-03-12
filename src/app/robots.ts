import type { MetadataRoute } from "next";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ethnicelegance.store";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/admin", "/account", "/checkout", "/track", "/login", "/signup"],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
