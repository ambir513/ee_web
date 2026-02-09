"use client";

import React from "react";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const banners = [
  {
    id: 1,
    image: "/images/kurta-1.png",
    label: "Spring / Summer 2026",
    title: "Where tradition meets modern elegance",
    description:
      "Discover exquisite handcrafted kurtas that celebrate the artistry of Indian textiles.",
    cta: "Shop New Arrivals",
  },
  {
    id: 2,
    image: "/images/kurta-2.jpg",
    label: "Exclusive Collection",
    title: "Silk kurtas crafted for grace",
    description:
      "Premium silk kurtas with intricate embroidery for the modern woman.",
    cta: "Explore Silk",
  },
  {
    id: 3,
    image: "/images/kurta-3.jpg",
    label: "Everyday Elegance",
    title: "Cotton comfort, timeless style",
    description:
      "Breathable cotton kurtas blending comfort with sophisticated design.",
    cta: "Shop Cotton",
  },
  {
    id: 4,
    image: "/images/kurta-4.jpg",
    label: "Festive Edit",
    title: "Celebrate in stunning kurtas",
    description:
      "Handpicked festive collection featuring rich fabrics and artisan work.",
    cta: "View Festive",
  },
];

export function Hero() {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const nextBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  }, []);

  const prevBanner = useCallback(() => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  }, []);

  const goToBanner = (index: number) => {
    setCurrentBanner(index);
  };

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      nextBanner();
    }
    if (touchStart - touchEnd < -75) {
      prevBanner();
    }
  };

  useEffect(() => {
    const interval = setInterval(nextBanner, 5000);
    return () => clearInterval(interval);
  }, [nextBanner]);

  return (
    <section
      className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel track */}
      <div
        ref={containerRef}
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentBanner * 100}%)` }}
      >
        {banners.map((b) => (
          <div key={b.id} className="relative min-w-full h-full flex-shrink-0">
            <Image
              src={b.image || "/placeholder.svg"}
              alt={b.title}
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/10 md:from-foreground/70 md:via-foreground/40 md:to-transparent" />
          </div>
        ))}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 z-10 flex items-center pointer-events-none">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-md pointer-events-auto">
            <p
              key={`label-${currentBanner}`}
              className="text-xs font-medium tracking-[0.2em] text-primary-foreground/70 uppercase mb-3 animate-in fade-in slide-in-from-left-4 duration-500"
            >
              {banners[currentBanner].label}
            </p>
            <h1
              key={`title-${currentBanner}`}
              className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-primary-foreground leading-[1.1] tracking-tight mb-4 animate-in fade-in slide-in-from-left-6 duration-500 delay-100"
            >
              {banners[currentBanner].title}
            </h1>
            <p
              key={`desc-${currentBanner}`}
              className="text-sm sm:text-base text-primary-foreground/80 leading-relaxed mb-6 animate-in fade-in slide-in-from-left-6 duration-500 delay-200"
            >
              {banners[currentBanner].description}
            </p>
            <div
              key={`cta-${currentBanner}`}
              className="animate-in fade-in slide-in-from-left-6 duration-500 delay-300"
            >
              <Button
                size="lg"
                className="bg-primary-foreground text-foreground group h-11 px-6 text-sm font-medium"
              >
                {banners[currentBanner].cta}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows - hidden on mobile */}
      <button
        type="button"
        onClick={prevBanner}
        className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
        aria-label="Previous banner"
      >
        <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>
      <button
        type="button"
        onClick={nextBanner}
        className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 hidden sm:flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
        aria-label="Next banner"
      >
        <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6" />
      </button>

      {/* Pagination dots */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3">
        {banners.map((b, index) => (
          <button
            type="button"
            key={b.id}
            onClick={() => goToBanner(index)}
            className={`transition-all duration-300 ${
              index === currentBanner
                ? "w-8 sm:w-10 h-1.5 sm:h-2 bg-primary-foreground rounded-full"
                : "w-1.5 sm:w-2 h-1.5 sm:h-2 bg-primary-foreground/40 rounded-full hover:bg-primary-foreground/60"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>

      {/* Banner counter */}
      <div className="absolute bottom-6 sm:bottom-8 right-4 sm:right-8 z-20 text-primary-foreground/60 text-xs sm:text-sm font-medium tracking-wider">
        <span className="text-primary-foreground">
          {String(currentBanner + 1).padStart(2, "0")}
        </span>
        <span className="mx-1">/</span>
        <span>{String(banners.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
