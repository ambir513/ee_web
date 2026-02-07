import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import {
  AboutHero,
  AboutStory,
  AboutValues,
  AboutWhyUs,
  AboutCta,
} from "@/components/landing/about-sections";

export const metadata = {
  title: "About Us | Ethnic Elegance",
  description:
    "Ethnic Elegance is a women's garments and ethnic wear retail website. Discover our story, values, and curated collection of kurtas, sarees, and more.",
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
