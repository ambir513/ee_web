import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ethnicelegance.store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        {
            url: `${SITE_URL}/products`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.9,
        },
        {
            url: `${SITE_URL}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
        },
        {
            url: `${SITE_URL}/contact`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 0.6,
        },
        {
            url: `${SITE_URL}/terms`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${SITE_URL}/policy`,
            lastModified: new Date(),
            changeFrequency: "yearly",
            priority: 0.3,
        },
    ];

    // Dynamic product pages
    let productPages: MetadataRoute.Sitemap = [];
    try {
        const res = await api.get<{
            status: boolean;
            data?: { products: Product[] };
        }>("/product?limit=1000");

        if (res?.status && res.data?.products) {
            productPages = res.data.products.map((product) => ({
                url: `${SITE_URL}/products/${product._id}`,
                lastModified: product.updatedAt
                    ? new Date(product.updatedAt)
                    : new Date(),
                changeFrequency: "weekly" as const,
                priority: 0.8,
            }));
        }
    } catch {
        // Sitemap will only contain static pages if API fails
    }

    return [...staticPages, ...productPages];
}
