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
    const fullDescription = product.description?.slice(0, 155)
      ? `${product.description.slice(0, 155)}... ${priceText} at Ethnic Elegance. Premium ethnic wear.`
      : `Shop ${product.name} at ${priceText}. Premium handcrafted ethnic wear at Ethnic Elegance.`;

    // Construct keywords based on product data
    const keywords = [
      product.name,
      product.category,
      product.subCategory,
      product.design,
      "ethnic wear",
      "ethnic clothing",
      "traditional wear",
      "buy online",
      "handcrafted",
      ...(product.description
        ? product.description.split(" ").slice(0, 3)
        : []),
    ].filter(Boolean);

    return {
      title: `${product.name} | Buy Premium Ethnic Wear Online at ₹${price.toLocaleString("en-IN")}`,
      description: fullDescription,
      keywords,
      alternates: { canonical: `${SITE_URL}/products/${id}` },
      robots: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
      openGraph: {
        title: `${product.name} | ₹${price.toLocaleString("en-IN")} | Ethnic Elegance`,
        description: fullDescription,
        url: `${SITE_URL}/products/${id}`,
        siteName: "Ethnic Elegance",
        type: "website",
        locale: "en_IN",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} - Ethnic Elegance`,
        description: fullDescription,
      },
      other: {
        "product:price:amount": String(price),
        "product:price:currency": "INR",
        "product:original_price:amount": String(product.mrp),
        "product:original_price:currency": "INR",
        "product:availability": product.isActive ? "in stock" : "out of stock",
        "product:category": product.category,
        "product:subcategory": product.subCategory,
        "product:design": product.design,
        ...(discount > 0 && { "product:sale_discount": `${discount}%` }),
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
      const images =
        product.variants?.flatMap((v) => v.images).filter(Boolean) || [];
      const discount =
        product.mrp > product.price
          ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
          : 0;

      // Create multiple schema types for comprehensive SEO
      jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "BreadcrumbList",
            "@id": `${SITE_URL}/products/${id}#breadcrumb`,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: SITE_URL,
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Products",
                item: `${SITE_URL}/products`,
              },
              {
                "@type": "ListItem",
                position: 3,
                name: product.category,
                item: `${SITE_URL}/products?category=${encodeURIComponent(product.category)}`,
              },
              {
                "@type": "ListItem",
                position: 4,
                name: product.name,
                item: `${SITE_URL}/products/${id}`,
              },
            ],
          },
          {
            "@type": "Product",
            "@id": `${SITE_URL}/products/${id}#product`,
            name: product.name,
            description: product.description,
            image:
              images.length > 0
                ? images
                : [`${SITE_URL}/images/placeholder.png`],
            sku: product.sku,
            gtin: product.sku,
            url: `${SITE_URL}/products/${id}`,
            category: product.category,
            brand: {
              "@type": "Brand",
              name: "Ethnic Elegance",
              url: SITE_URL,
            },
            manufacturer: {
              "@type": "Organization",
              name: "Ethnic Elegance",
              url: SITE_URL,
            },
            color: product.variants?.[0]?.color || "Multi",
            material: "Premium Cotton/Blend",
            offers: {
              "@type": "Offer",
              url: `${SITE_URL}/products/${id}`,
              priceCurrency: "INR",
              price: String(product.price),
              priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0],
              availability: product.isActive
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              itemCondition: "https://schema.org/NewCondition",
              seller: {
                "@type": "Organization",
                name: "Ethnic Elegance",
                url: SITE_URL,
              },
              ...(product.mrp > product.price && {
                priceCurrency: "INR",
                price: String(product.price),
              }),
            },
            shippingDetails: {
              "@type": "OfferShippingDetails",
              shippingRate: {
                "@type": "PriceSpecification",
                priceCurrency: "INR",
                price: "Free",
              },
              shippingDestination: {
                "@type": "DeliveryTimeSettings",
                areaServed: "IN",
                deliveryTime: {
                  "@type": "QuantitativeValue",
                  unitCode: "DAY",
                  value: "3-7",
                },
              },
            },
            reviews: product.ratingCount > 0 ? [] : undefined,
            isPartOf: {
              "@type": "Collection",
              name: `${product.category} - ${product.subCategory}`,
            },
          },
        ],
      };

      // Add ratings if available
      if (product.averageRating > 0 && product.ratingCount > 0) {
        (jsonLd["@graph"][1] as any).aggregateRating = {
          "@type": "AggregateRating",
          ratingValue: product.averageRating,
          reviewCount: product.ratingCount,
          bestRating: "5",
          worstRating: "1",
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
