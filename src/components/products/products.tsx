"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Grid3X3,
  List,
  Heart,
  Star,
  ShoppingCart,
  Filter,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useProductStore } from "@/components/products/store";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "MEN", label: "Men" },
  { value: "WOMEN", label: "Women" },
  { value: "KIDS", label: "Kids" },
];

const DESIGNS = [
  { value: "", label: "All Designs" },
  { value: "Floral Print", label: "Floral Print" },
  { value: "Ethnic Print", label: "Ethnic Print" },
  { value: "Abstract Print", label: "Abstract Print" },
  { value: "Solid", label: "Solid" },
  { value: "Checks", label: "Checks" },
  { value: "Stripes", label: "Stripes" },
  { value: "Bandhani", label: "Bandhani" },
  { value: "Leheriya", label: "Leheriya" },
  { value: "Tie & Dye", label: "Tie & Dye" },
  { value: "Block Print", label: "Block Print" },
];

const RATINGS = [
  { value: "", label: "Any Rating" },
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
  { value: "1", label: "1+ Stars" },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const filledColor = "fill-amber-400 text-amber-400";
  const emptyColor = "text-muted-200 fill-muted-200";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const filledAmount = Math.min(1, Math.max(0, rating - starIndex + 1));
        if (filledAmount >= 1) {
          return (
            <Star
              key={starIndex}
              className={cn(sizeClass, filledColor, "shrink-0")}
            />
          );
        }
        if (filledAmount >= 0.5) {
          return (
            <div key={starIndex} className="relative inline-block shrink-0">
              <Star className={cn(sizeClass, emptyColor)} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                <Star className={cn(sizeClass, filledColor)} />
              </span>
            </div>
          );
        }
        return (
          <Star key={starIndex} className={cn(sizeClass, emptyColor)} />
        );
      })}
    </div>
  );
}

function FilterSection() {
  const {
    category,
    subCategory,
    design,
    priceMin,
    priceMax,
    rating,
    setCategory,
    setSubCategory,
    setDesign,
    setPriceMin,
    setPriceMax,
    setRating,
    resetFilters,
    fetchProducts,
  } = useProductStore();

  const handleApplyFilters = () => {
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={resetFilters}
        >
          <X className="mr-1 h-3 w-3" />
          Clear all
        </Button>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Category</Label>
        <Select value={category || " "} onValueChange={(v) => setCategory(v === " " ? "" : v)}>
          <SelectTrigger className="h-9" aria-label="Category">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectPopup>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value || "all"} value={c.value || " "}>
                {c.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Sub Category</Label>
        <Input
          placeholder="e.g. Kurta, Shirt"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          className="h-9"
        />
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Design</Label>
        <Select value={design || " "} onValueChange={(v) => setDesign(v === " " ? "" : v)}>
          <SelectTrigger className="h-9" aria-label="Design">
            <SelectValue placeholder="Select design" />
          </SelectTrigger>
          <SelectPopup>
            {DESIGNS.map((d) => (
              <SelectItem key={d.value || "all"} value={d.value || " "}>
                {d.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Rating</Label>
        <Select value={rating || " "} onValueChange={(v) => setRating(v === " " ? "" : v)}>
          <SelectTrigger className="h-9" aria-label="Rating">
            <SelectValue placeholder="Minimum rating" />
          </SelectTrigger>
          <SelectPopup>
            {RATINGS.map((r) => (
              <SelectItem key={r.value || "all"} value={r.value || " "}>
                {r.label}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>
      </div>

      <div>
        <Label className="mb-2 block text-sm font-medium">Price Range (₹)</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9"
            min={0}
          />
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9"
            min={0}
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="mt-2 w-full"
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

function getProductImage(product: { variants?: Array<{ images?: string[] }> }): string | null {
  const img = product.variants?.[0]?.images?.[0];
  return img || null;
}

export default function ProductList() {
  const {
    filteredProducts,
    isLoading,
    error,
    searchQuery,
    viewMode,
    setSearchQuery,
    setViewMode,
    fetchProducts,
    page,
    totalProducts,
    setPage,
  } = useProductStore();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const limit = 12;
  const totalPages = Math.ceil(totalProducts / limit) || 1;

  return (
    <div className="px-4 py-4 sm:py-6">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-4 rounded-lg border bg-card p-4">
            <FilterSection />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent lg:hidden"
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                      <div className="py-4">
                        <FilterSection />
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <span className="text-muted-foreground text-sm">
                  {isLoading ? "Loading..." : `${filteredProducts.length} products`}
                </span>
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v)}
                className="hidden sm:flex"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px] sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ToggleGroup
                type="single"
                value={viewMode}
                onValueChange={(v) => v && setViewMode(v)}
                className="sm:hidden"
              >
                <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
                  <Grid3X3 className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="List view" size="sm">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={fetchProducts}>
                Retry
              </Button>
            </div>
          ) : isLoading && filteredProducts.length === 0 ? (
            <div className="grid gap-4 sm:gap-6 xs:grid-cols-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square animate-pulse bg-muted" />
                  <CardContent className="p-4 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                    <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                No products found matching your filters.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Try adjusting your search or filters.
              </p>
              <Button variant="outline" className="mt-4" onClick={fetchProducts}>
                View All Products
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4 sm:gap-6",
                viewMode === "grid"
                  ? "xs:grid-cols-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              )}
            >
              {filteredProducts.map((product) => {
                const img = getProductImage(product);
                const discount =
                  product.mrp > product.price
                    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                    : 0;

                return (
                  <Card
                    key={product._id}
                    className="group overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/product/${product._id}`}>
                      <CardContent className="p-0">
                        <div className="relative aspect-square overflow-hidden bg-muted">
                          {img ? (
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <span className="text-4xl">📦</span>
                            </div>
                          )}
                          {product.label && (
                            <Badge className="absolute left-2 top-2 bg-primary text-xs">
                              {product.label}
                            </Badge>
                          )}
                          {discount > 0 && (
                            <Badge
                              variant="destructive"
                              className="absolute right-2 top-2 text-xs"
                            >
                              -{discount}%
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 opacity-0 transition-opacity group-hover:opacity-100"
                            onClick={(e) => e.preventDefault()}
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="space-y-2 p-3 sm:p-4">
                          <p className="text-muted-foreground text-xs uppercase tracking-wide">
                            {product.category} • {product.subCategory}
                          </p>
                          <h3 className="line-clamp-2 text-sm font-medium leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-primary sm:text-lg">
                              ₹{product.price.toLocaleString("en-IN")}
                            </span>
                            {product.mrp > product.price && (
                              <span className="text-muted-foreground text-xs line-through sm:text-sm">
                                ₹{product.mrp.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                          {(product.averageRating > 0 || product.ratingCount > 0) && (
                            <div className="flex items-center gap-1.5">
                              <StarRating
                                rating={product.averageRating || 0}
                                size="sm"
                              />
                              <span className="text-muted-foreground text-xs">
                                {product.averageRating > 0
                                  ? product.averageRating % 1 === 0.5
                                    ? product.averageRating.toFixed(1)
                                    : Math.round(product.averageRating)
                                  : "0"}
                                {product.ratingCount > 0 && (
                                  <span className="ml-0.5">
                                    ({product.ratingCount})
                                  </span>
                                )}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 pt-2">
                            <Button
                              className="flex-1"
                              size="sm"
                              onClick={(e) => e.preventDefault()}
                            >
                              <ShoppingCart className="mr-1 h-4 w-4 sm:mr-2" />
                              <span className="hidden xs:inline">Add to cart</span>
                              <span className="xs:hidden">Add</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-transparent px-2 sm:px-3"
                              onClick={(e) => e.preventDefault()}
                            >
                              <Heart className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
