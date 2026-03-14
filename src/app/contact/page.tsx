import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Features } from "@/components/landing/feature";
import ContactPageContent from "@/components/landing/contact-sections";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Ethnic Elegance for any queries about orders, shipping, returns or collaborations. We respond within 24–48 hours.",
  alternates: { canonical: "/contact" },
  keywords: [
    "contact ethnic elegance",
    "customer support",
    "order help",
    "shipping support",
    "returns support",
    "fashion store contact",
  ],
  openGraph: {
    title: "Contact Us | Ethnic Elegance",
    description:
      "Reach out to Ethnic Elegance for order enquiries, feedback, or partnership opportunities.",
    url: "/contact",
    type: "website",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Contact Ethnic Elegance",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Ethnic Elegance",
    description:
      "Reach out to Ethnic Elegance for order enquiries, feedback, or partnership opportunities.",
    images: ["/images/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="font-sans min-h-screen bg-background">
        <ContactPageContent />
        <Features />
      </main>
      <Footer />
    </>
  );
}
