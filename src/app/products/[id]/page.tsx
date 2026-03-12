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
    const image =
      product.variants?.[0]?.images?.[0] || "/images/og-banner.png";
    const price = product.price;
    const discount =
      product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0;

    const title = product.name;
    const description =
      product.description?.slice(0, 155) ||
      `Shop ${product.name} at Ethnic Elegance. Premium ethnic wear starting at ₹${price}.`;

    return {
      title,
      description,
      alternates: { canonical: `/products/${id}` },
      openGraph: {
        title: `${product.name} | Ethnic Elegance`,
        description,
        url: `${SITE_URL}/products/${id}`,
        siteName: "Ethnic Elegance",
        images: [
          {
            url: image,
            width: 800,
            height: 800,
            alt: product.name,
          },
        ],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.name} | Ethnic Elegance`,
        description,
        images: [image],
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

export default function Page({ params }: Props) {
  return <ProductPage params={params} />;
}
