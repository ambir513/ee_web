import { Suspense } from "react";
import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { OrderTracking } from "@/components/order/order-tracking";

export const metadata = {
    title: "Track Your Order | Order Status",
    description:
        "Track your order in real-time. Get live updates on your shipment status, location, and estimated delivery date.",
};

export default function TrackPage() {
    return (
        <>
            <Header />
            <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center text-muted-foreground text-sm">Loading...</div>}>
                <OrderTracking />
            </Suspense>
            <Footer />
        </>
    );
}
