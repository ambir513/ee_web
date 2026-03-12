import { Suspense } from "react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { OrderTracking } from "@/components/order/order-tracking";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Your Order",
  description:
    "Track your Ethnic Elegance order in real-time. Get live updates on shipment status, location, and estimated delivery date.",
  alternates: { canonical: "/track" },
  robots: { index: false, follow: false },
};

export default function TrackPage() {
  return (
    <>
      <Header />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground text-sm">
            Loading...
          </div>
        }
      >
        <OrderTracking />
      </Suspense>
      <Footer />
    </>
  );
}
