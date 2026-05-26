import React from "react";
import type { Metadata } from "next";
import { api } from "@/lib/api";
import type { Product } from "@/types/product";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import ProductSection from "@/components/products/products";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ethnicelegance.store";

async function getProductsForMetadata() {
  try {
    const res = await api.get<{
      status: boolean;
      data?: { products: Product[] };
    }>("/product?limit=12&sort=newest");

    if (res?.status && res.data?.products) {
      return res.data.products;
    }
  } catch (error) {
    console.error("Failed to fetch products for metadata:", error);
  }
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const products = await getProductsForMetadata();

  // Create dynamic description based on product types
  const categories = [...new Set(products.map((p) => p.category))].slice(0, 3);
  const subCategories = [...new Set(products.map((p) => p.subCategory))].slice(
    0,
    3,
  );

  const categoryText =
    categories.length > 0 ? categories.join(", ") : "ethnic wear";
  const productTypesText =
    subCategories.length > 0
      ? `${subCategories.join(", ")}`
      : "kurtas, sarees, lehengas";

  const dynamicDescription = `Shop ${productTypesText} and premium women's ethnic wear online. Browse ${products.length}+ authentic handcrafted designs with free delivery across India at best prices.`;

  return {
    title: "Premium Women's Ethnic Wear Online | Buy Kurtas, Sarees, Lehengas",
    description: dynamicDescription,
    keywords: [
      "women's ethnic wear",
      "kurtas online",
      "sarees",
      "lehengas",
      "ethnic clothing",
      "Indian ethnic wear",
      "designer ethnic wear",
      "buy online",
      "free delivery",
      categoryText,
      ...subCategories,
    ],
    alternates: { canonical: `${SITE_URL}/products` },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title: "Premium Women's Ethnic Wear Collection | Shop Online",
      description: dynamicDescription,
      url: `${SITE_URL}/products`,
      siteName: "Ethnic Elegance",
      type: "website",
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: "Women's Ethnic Wear | Ethnic Elegance",
      description: dynamicDescription,
    },
  };
}

export default async function ProductPage() {
  const products = await getProductsForMetadata();

  // Generate JSON-LD for ProductCollection with individual products
  const productListItems = products.slice(0, 12).map((product, index) => {
    const images =
      product.variants?.flatMap((v) => v.images).filter(Boolean) || [];
    const discount =
      product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    return {
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE_URL}/products/${product._id}`,
      image: images[0] || `${SITE_URL}/images/placeholder.png`,
      name: product.name,
      description: product.description?.substring(0, 100),
      brand: {
        "@type": "Brand",
        name: "Ethnic Elegance",
      },
      offers: {
        "@type": "Offer",
        url: `${SITE_URL}/products/${product._id}`,
        priceCurrency: "INR",
        price: String(product.price),
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        availability: product.isActive
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        ...(discount > 0 && {
          discount: `${discount}% off`,
        }),
      },
      ...(product.averageRating > 0 && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: product.averageRating,
          reviewCount: product.ratingCount,
          bestRating: "5",
          worstRating: "1",
        },
      }),
    };
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/products#webpage`,
        url: `${SITE_URL}/products`,
        name: "Women's Ethnic Wear Collection",
        description: `Shop ${products.length}+ premium handcrafted women's ethnic wear including kurtas, sarees, lehengas and traditional Indian clothing at Ethnic Elegance.`,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        breadcrumb: {
          "@id": `${SITE_URL}/products#breadcrumb`,
        },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/products#breadcrumb`,
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
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/products#product-list`,
        url: `${SITE_URL}/products`,
        name: "Premium Ethnic Wear Collection",
        description: "Featured premium women's ethnic wear products",
        numberOfItems: products.length,
        itemListElement: productListItems,
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/products#page`,
        url: `${SITE_URL}/products`,
        name: "Premium Women's Ethnic Wear Online",
        mainEntity: {
          "@id": `${SITE_URL}/products#product-list`,
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main className="font-sans max-w-7xl 2xl:mx-auto mx-4 space-y-16 ">
        <ProductSection />
      </main>
      <Footer />
    </>
  );
}
