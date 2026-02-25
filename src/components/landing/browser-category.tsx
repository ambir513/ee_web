"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Star,
  ArrowRight,
  Loader2,
  ShoppingBag,
  Heart,
} from "lucide-react";

export function BrowserCategorySection() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["latestProducts"],
    queryFn: async () => {
      const response: any = await api.get("/product/latest?limit=4");
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const products = data?.data || [];

  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-serif">New Arrivals</h2>
          <p className="text-muted-foreground text-sm">
            The latest additions to our curated collection
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (isError || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      {/* Section Header — clean and minimal */}
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Just Dropped
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif tracking-tight text-foreground">
            New Arrivals
          </h2>
          <p className="text-muted-foreground text-sm max-w-md">
            Freshly curated styles, handpicked for you.
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary transition-colors group"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {products.slice(0, 4).map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Mobile CTA */}
      <div className="flex sm:hidden justify-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground border border-border rounded-full px-5 py-2 hover:bg-accent transition-colors"
        >
          View all new arrivals
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: any }) {
  const image = product.variants?.[0]?.images?.[0];
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link href={`/products/${product._id}`} className="group block">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-muted mb-3">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
            {product.name?.substring(0, 2)?.toUpperCase()}
          </div>
        )}

        {/* Discount badge — top left */}
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 z-10 bg-foreground text-background text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
            {discount}% off
          </span>
        )}

        {/* Wishlist button — top right */}
        <button
          type="button"
          className="absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110"
          onClick={(e) => e.preventDefault()}
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-foreground" />
        </button>

        {/* Quick shop — bottom on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <span className="flex items-center justify-center gap-1.5 w-full bg-white/95 backdrop-blur-sm text-foreground text-xs font-semibold py-2.5 rounded-md shadow-sm hover:bg-white transition-colors">
            <ShoppingBag className="h-3.5 w-3.5" />
            Quick Shop
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-1.5">
        {/* Category */}
        {product.category && (
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            {product.category}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-sm font-medium leading-snug line-clamp-1 text-foreground group-hover:text-primary transition-colors duration-200">
          {product.name}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-foreground">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          {discount > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>

        {/* Rating */}
        {product.averageRating > 0 && (
          <div className="flex items-center gap-1 pt-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">
              {product.averageRating.toFixed(1)}
            </span>
            {product.ratingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                ({product.ratingCount})
              </span>
            )}
          </div>
        )}

        {/* Color swatches */}
        {product.variants?.length > 1 && (
          <div className="flex items-center gap-1 pt-1">
            {product.variants.slice(0, 4).map((v: any, i: number) => (
              <div
                key={i}
                className="h-3.5 w-3.5 rounded-full border border-border shadow-sm"
                style={{
                  backgroundColor:
                    v.color?.toLowerCase() === "multi"
                      ? undefined
                      : v.color?.toLowerCase(),
                }}
                title={v.color}
              >
                {v.color?.toLowerCase() === "multi" && (
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400" />
                )}
              </div>
            ))}
            {product.variants.length > 4 && (
              <span className="text-[10px] text-muted-foreground ml-0.5">
                +{product.variants.length - 4}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
