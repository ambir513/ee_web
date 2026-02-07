import React from "react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
// import ProductSection from "@/components/products/products.tsx";
export default function ProductPage() {
  return (
    <>
      <Header />
      <main className="font-sans max-w-7xl 2xl:mx-auto mx-4 space-y-16 ">
        {/* <ProductSection /> */}
      </main>
      <Footer />
    </>
  );
}
