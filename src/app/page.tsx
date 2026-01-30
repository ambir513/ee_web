import { BrowserCategorySection } from "@/components/landing/browser-category";
import Image from "next/image";
import { CarouselHeroSection } from "@/components/landing/carousel-hero";
import { BentoSection } from "@/components/landing/bento";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import { PopularKurta } from "@/components/landing/popular-product";
import { Testimonials } from "@/components/landing/testimonials";

export default function Home() {
  return (
    <>
      {/* <OfferBanner /> */}
      <Header />
      <main className="max-w-7xl 2xl:mx-auto mx-4 ">
        <CarouselHeroSection />
        <BrowserCategorySection />
        <PopularKurta />
        <BentoSection />
        <Testimonials />
      </main>

      <Footer />
    </>
  );
}
