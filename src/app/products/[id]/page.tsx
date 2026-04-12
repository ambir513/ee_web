import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import ProductPage from "./product-page-client";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ethnicelegance.store";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await api.get<{ status: boolean; data?: Product }>(
      `/product/${encodeURIComponent(id)}`,
    );

    if (!res?.status || !res.data) {
      return {
        title: "Product Not Found",
        description:
          "The requested product could not be found on Ethnic Elegance.",
      };
    }

    const product = res.data;
    const price = product.price;
    const discount =
      product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const title = product.name;
    const priceText = `₹${price.toLocaleString("en-IN")}`;
    const description = product.description?.slice(0, 120)
      ? `${product.description.slice(0, 120)} — ${priceText} at Ethnic Elegance.`
      : `Shop ${product.name} at ${priceText}. Premium ethnic wear at Ethnic Elegance.`;

    return {
      title,
      description,
      alternates: { canonical: `/products/${id}` },
      openGraph: {
        title: `${product.name} | Ethnic Elegance`,
        description,
        url: `${SITE_URL}/products/${id}`,
        siteName: "Ethnic Elegance",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Ethnic Elegance`,
        description,
      },
      other: {
        "product:price:amount": String(price),
        "product:price:currency": "INR",
        ...(discount > 0 && { "product:sale_discount": `${discount}%` }),
        ...(product.category && { "product:category": product.category }),
      },
    };
  } catch {
    return {
      title: "Product",
      description: "Shop premium ethnic wear at Ethnic Elegance.",
    };
  }
}

export default async function Page({ params }: Props) {
  const { id } = await params;
  let jsonLd: Record<string, any> | null = null;

  try {
    const res = await api.get<{ status: boolean; data?: Product }>(
      `/product/${encodeURIComponent(id)}`,
    );

    if (res?.status && res.data) {
      const product = res.data;
      const images = product.variants?.flatMap((v) => v.images).filter(Boolean) || [];

      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        image: images.length > 0 ? images : undefined,
        description: product.description,
        sku: product.sku,
        category: product.category,
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/products/${id}`,
          priceCurrency: "INR",
          price: product.price,
          availability: product.isActive
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        },
        brand: {
          "@type": "Brand",
          name: "Ethnic Elegance",
        },
      };

      if (product.averageRating > 0 && product.ratingCount > 0) {
        jsonLd.aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: product.averageRating,
          reviewCount: product.ratingCount,
        };
      }
    }
  } catch (error) {
    console.error("Failed to fetch product for JSON-LD", error);
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPage params={params} />
    </>
  );
}
