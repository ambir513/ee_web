"use client";

import Image from "next/image";
import { Star, Quote } from "lucide-react";

interface Testimonial {
  id: number;
  name: string;
  location: string;
  image: string;
  rating: number;
  product: string;
  review: string;
  isSpecial?: boolean;
}

const testimonials: Testimonial[] = [
  {
    id: 0,
    name: "Ethnic Elegance",
    location: "Our First Order",
    image: "/images/first-order.png",
    rating: 5,
    product: "First Customer — A Milestone Moment",
    review:
      "Yay! Our first order is received! Thank you for trusting Ethnic Elegance. Your support means the world to us. We're excited to prepare something special for you.",
    isSpecial: true,
  },
];

export function Testimonials() {
  const t = testimonials[0];

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-2">
            Our Story
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl tracking-tight text-foreground mb-3">
            A Milestone We Cherish
          </h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Every journey starts with a single step — this was ours.
          </p>
        </div>

        {/* Featured Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Image */}
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-amber-50">
              <Image
                src={t.image}
                alt={t.product}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center">
              {/* Quote icon */}
              <Quote className="h-8 w-8 text-primary/20 mb-5" />

              {/* Review text */}
              <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground font-light mb-6">
                "{t.review}"
              </blockquote>

              {/* Rating */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-border mb-4" />

              {/* Attribution */}
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {t.name}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {t.product}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
