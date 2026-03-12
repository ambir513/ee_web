import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import {
  AboutHero,
  AboutStory,
  AboutValues,
  AboutWhyUs,
  AboutCta,
} from "@/components/landing/about-sections";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Ethnic Elegance – our story, values, and commitment to premium women's ethnic wear. Curated kurtas, sarees, lehengas and handcrafted designs.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us | Ethnic Elegance",
    description:
      "Discover the story behind Ethnic Elegance – premium women's ethnic wear with handcrafted designs and quality fabrics.",
    url: "/about",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="font-sans min-h-screen">
        <AboutHero />
        <AboutStory />
        <AboutValues />
        <AboutWhyUs />
        <AboutCta />
      </main>
      <Footer />
    </>
  );
}
