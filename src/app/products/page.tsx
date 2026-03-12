import React from "react";
import type { Metadata } from "next";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import ProductSection from "@/components/products/products";

export const metadata: Metadata = {
  title: "Shop Women's Ethnic Wear",
  description:
    "Browse our complete collection of premium women's ethnic wear – kurtas, sarees, lehengas, and more. Filter by category, price, colour and rating.",
  alternates: { canonical: "/products" },
  openGraph: {
    title: "Shop Women's Ethnic Wear | Ethnic Elegance",
    description:
      "Explore the full Ethnic Elegance catalogue. Handcrafted kurtas, sarees, lehengas and designer ethnic wear for every occasion.",
    url: "/products",
  },
};

export default function ProductPage() {
  return (
    <>
      <Header />
      <main className="font-sans max-w-7xl 2xl:mx-auto mx-4 space-y-16 ">
        <ProductSection />
      </main>
      <Footer />
    </>
  );
}
