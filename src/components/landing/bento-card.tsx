"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const collections = [
  {
    id: 1,
    title: "New Arrivals",
    subtitle: "Spring Collection",
    description: "Discover our latest handcrafted kurtas with intricate embroidery",
    href: "#",
    size: "large",
  },
  {
    id: 2,
    title: "Chikankari",
    subtitle: "Lucknowi Elegance",
    description: "Timeless white threadwork",
    image: "/images/kurta-2.jpg",
    href: "#",
    size: "medium",
  },
  {
    id: 3,
    title: "Festive Edit",
    subtitle: "Celebration Ready",
    description: "Silk & chanderi collection",
    image: "/images/kurta-3.jpg",
    href: "/products",
    size: "medium",
  },
  {
    id: 4,
    title: "Everyday Essentials",
    subtitle: "Comfort Meets Style",
    description: "Cotton kurtas for daily elegance",
    image: "/images/kurta-4.jpg",
    href: "/products",
    size: "small",
  },
  {
    id: 5,
    title: "Artisan Crafted",
    subtitle: "Handmade Heritage",
    description: "Each piece tells a story",
    image: "/images/kurta-5.jpg",
    href: "/products",
    size: "featured",
  },
]

export function BentoGrid() {
  return (
    <section className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-10 lg:mb-16">
        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-3">
          Curated Collections
        </p>
        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-foreground tracking-tight text-balance">
          Timeless elegance,
          <br className="hidden sm:block" />
          crafted for you
        </h2>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 auto-rows-[280px] lg:auto-rows-[320px]">
        {/* Large featured item - spans 2 columns and 2 rows */}
        <BentoCard
          collection={collections[3]}
          className="md:col-span-2 md:row-span-2"
        />

        {/* Medium items */}
        <BentoCard collection={collections[1]} className="lg:col-span-1" />
        <BentoCard collection={collections[2]} className="lg:col-span-1" />

        {/* Bottom row */}
        <BentoCard
          collection={collections[4]}
          className="md:col-span-2 lg:col-span-2"
        />
      </div>
    </section>
  )
}

function BentoCard({
  collection,
  className = "",
}: {
  collection: (typeof collections)[0]
  className?: string
}) {
  return (
    <Link
      href={collection.href}
      className={`group relative overflow-hidden rounded-lg bg-card ${className}`}
    >
      {/* Background image */}
      <Image
        src={collection.image || "/placeholder.svg"}
        alt={collection.title}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-5 lg:p-6 flex flex-col justify-end">
        <p className="text-xs font-medium tracking-widest text-primary-foreground/80 uppercase mb-1">
          {collection.subtitle}
        </p>
        <h3 className="font-serif text-xl lg:text-2xl font-medium text-primary-foreground mb-2">
          {collection.title}
        </h3>
        <p className="text-sm text-primary-foreground/80 mb-4 line-clamp-2">
          {collection.description}
        </p>

        {/* Explore button */}
        <div className="flex items-center gap-2 text-sm font-medium text-primary-foreground opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <span>Explore</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  )
}
