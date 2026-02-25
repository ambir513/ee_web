"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "../ui/card";
import Image from "next/image";
import { AspectRatio } from "../ui/aspect-ratio";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { Star, ArrowRight, Loader2, Trophy, Flame } from "lucide-react";

export function PopularKurta() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["popularProducts"],
    queryFn: async () => {
      const response: any = await api.get("/product/popular?limit=8");
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
          <h2 className="text-2xl font-semibold">Popular Kurtas</h2>
          <p className="text-muted-foreground">
            Our most loved pieces, rated highest by our customers
          </p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </section>
    );
  }

  if (isError || products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10">
              <Flame className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Popular Kurtas
            </h2>
          </div>
          <p className="text-muted-foreground text-sm max-w-md">
            Our most loved pieces, rated highest by customers for quality,
            comfort, and style.
          </p>
        </div>
        <Link
          href="/products"
          className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
        >
          View All
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.slice(0, 8).map((product: any, index: number) => (
          <PopularProductCard
            key={product._id}
            product={product}
            rank={index + 1}
          />
        ))}
      </div>

      {/* Mobile View All */}
      <div className="flex sm:hidden justify-center">
        <Link href="/products">
          <Button variant="outline" className="gap-2">
            View All Popular Kurtas
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </section>
  );
}

function PopularProductCard({
  product,
  rank,
}: {
  product: any;
  rank: number;
}) {
  const image = product.variants?.[0]?.images?.[0];
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Link href={`/products/${product._id}`} className="group block">
      <Card className="overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg hover:border-border hover:-translate-y-0.5 relative">
        {/* Rank badge */}
        {rank <= 3 && (
          <div className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white text-xs font-bold shadow-md">
            {rank}
          </div>
        )}

        <CardHeader className="p-0 relative">
          <AspectRatio ratio={3 / 4} className="bg-muted overflow-hidden">
            {image ? (
              <Image
                src={image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground bg-muted">
                {product.name?.substring(0, 3)?.toUpperCase()}
              </div>
            )}
          </AspectRatio>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.label && (
              <Badge
                variant="secondary"
                className="text-[10px] font-semibold px-2 py-0.5 bg-background/90 backdrop-blur-sm border border-border/50"
              >
                {product.label}
              </Badge>
            )}
            {discount > 0 && (
              <Badge className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-600 text-white border-0">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Rating pill */}
          {product.averageRating > 0 && (
            <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 backdrop-blur-sm px-2 py-1 border border-border/50">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold text-foreground">
                {product.averageRating.toFixed(1)}
              </span>
              {product.ratingCount > 0 && (
                <span className="text-[10px] text-muted-foreground">
                  ({product.ratingCount})
                </span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="p-3 sm:p-4 space-y-1.5">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-foreground">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {discount > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>

          {product.variants?.length > 0 && (
            <div className="flex items-center gap-1 pt-0.5">
              {product.variants.slice(0, 4).map((v: any, i: number) => (
                <div
                  key={i}
                  className="h-3.5 w-3.5 rounded-full border border-border/80 shadow-sm"
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
        </CardContent>
      </Card>
    </Link>
  );
}
