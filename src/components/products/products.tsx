"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Grid3X3,
  LayoutList,
  Heart,
  Star,
  ShoppingCart,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Package,
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
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";

import {
  useProducts,
  FetchProductsParams,
  type ProductListResult,
} from "@/components/products/store";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                  CONSTANTS                                 */
/* -------------------------------------------------------------------------- */

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
  { value: "4", label: "4★ & above" },
  { value: "3", label: "3★ & above" },
  { value: "2", label: "2★ & above" },
  { value: "1", label: "1★ & above" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
];

/* -------------------------------------------------------------------------- */
/*                               STAR RATING                                  */
/* -------------------------------------------------------------------------- */

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const filled = Math.min(1, Math.max(0, rating - starIndex + 1));
        if (filled >= 1) {
          return (
            <Star
              key={starIndex}
              className={cn(sizeClass, "fill-amber-400 text-amber-400 shrink-0")}
            />
          );
        }
        if (filled >= 0.5) {
          return (
            <div key={starIndex} className="relative inline-block shrink-0">
              <Star className={cn(sizeClass, "text-muted-foreground/30 fill-muted-foreground/30")} />
              <span className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
                <Star className={cn(sizeClass, "fill-amber-400 text-amber-400")} />
              </span>
            </div>
          );
        }
        return (
          <Star
            key={starIndex}
            className={cn(sizeClass, "text-muted-foreground/30 fill-muted-foreground/30 shrink-0")}
          />
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                            COLLAPSIBLE SECTION                             */
/* -------------------------------------------------------------------------- */

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/60 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {title}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isOpen ? "mt-3 max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               FILTER SECTION                               */
/* -------------------------------------------------------------------------- */

function FilterSection({
  filters,
  setFilters,
  onApplyFilters,
}: {
  filters: FetchProductsParams & { viewMode?: string };
  setFilters: React.Dispatch<
    React.SetStateAction<FetchProductsParams & { viewMode?: string }>
  >;
  onApplyFilters: () => void;
}) {
  const handleFilterChange = (
    key: keyof FetchProductsParams,
    value: string | number | null,
  ) => {
    const normalizedValue = value ?? "";
    setFilters((prev) => ({ ...prev, [key]: normalizedValue, page: 1 }));
  };

  const activeFilterCount = [
    filters.category,
    filters.subCategory,
    filters.design,
    filters.priceMin,
    filters.priceMax,
    filters.rating,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      category: "",
      subCategory: "",
      design: "",
      priceMin: "",
      priceMax: "",
      rating: "",
      page: 1,
      limit: 12,
      viewMode: "grid",
    });
    onApplyFilters();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="text-xs text-muted-foreground hover:text-rose-500 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      <Separator className="!mt-3" />

      {/* Category */}
      <FilterGroup title="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.value).map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() =>
                handleFilterChange(
                  "category",
                  filters.category === c.value ? "" : c.value,
                )
              }
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                filters.category === c.value
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Sub Category */}
      <FilterGroup title="Sub Category" defaultOpen={false}>
        <Input
          className="h-9 text-sm"
          placeholder="e.g. Kurta, Saree, Lehenga"
          value={filters.subCategory || ""}
          onChange={(e) => handleFilterChange("subCategory", e.target.value)}
        />
      </FilterGroup>

      {/* Design */}
      <FilterGroup title="Design / Pattern">
        <div className="flex flex-wrap gap-1.5">
          {DESIGNS.filter((d) => d.value).map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() =>
                handleFilterChange(
                  "design",
                  filters.design === d.value ? "" : d.value,
                )
              }
              className={cn(
                "rounded-md border px-2.5 py-1 text-[11px] font-medium transition-all duration-150",
                filters.design === d.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title="Customer Rating" defaultOpen={false}>
        <div className="flex flex-col gap-1.5">
          {RATINGS.filter((r) => r.value).map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() =>
                handleFilterChange(
                  "rating",
                  filters.rating === r.value ? "" : r.value,
                )
              }
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-all",
                filters.rating === r.value
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <StarRating rating={parseInt(r.value)} size="sm" />
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup title="Price Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">
                Min (₹)
              </Label>
              <Input
                type="number"
                min={0}
                className="h-9 text-sm"
                placeholder="0"
                value={filters.priceMin || ""}
                onChange={(e) =>
                  handleFilterChange("priceMin", e.target.value)
                }
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 block">
                Max (₹)
              </Label>
              <Input
                type="number"
                min={0}
                className="h-9 text-sm"
                placeholder="Any"
                value={filters.priceMax || ""}
                onChange={(e) =>
                  handleFilterChange("priceMax", e.target.value)
                }
              />
            </div>
          </div>
          {/* Quick price presets */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Under ₹999", min: "", max: "999" },
              { label: "₹1K – ₹2K", min: "1000", max: "2000" },
              { label: "₹2K – ₹5K", min: "2000", max: "5000" },
              { label: "₹5K+", min: "5000", max: "" },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    priceMin: preset.min,
                    priceMax: preset.max,
                    page: 1,
                  }));
                }}
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px] font-medium transition-all",
                  filters.priceMin === preset.min &&
                    filters.priceMax === preset.max
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full text-xs"
            onClick={onApplyFilters}
          >
            Apply Price Filter
          </Button>
        </div>
      </FilterGroup>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                             ACTIVE FILTER CHIPS                            */
/* -------------------------------------------------------------------------- */

function ActiveFilters({
  filters,
  setFilters,
}: {
  filters: FetchProductsParams & { viewMode?: string };
  setFilters: React.Dispatch<
    React.SetStateAction<FetchProductsParams & { viewMode?: string }>
  >;
}) {
  const chips: { label: string; key: string }[] = [];
  if (filters.category) chips.push({ label: filters.category as string, key: "category" });
  if (filters.subCategory) chips.push({ label: `Sub: ${filters.subCategory}`, key: "subCategory" });
  if (filters.design) chips.push({ label: filters.design as string, key: "design" });
  if (filters.rating) chips.push({ label: `${filters.rating}★+`, key: "rating" });
  if (filters.priceMin || filters.priceMax) {
    const min = filters.priceMin || "0";
    const max = filters.priceMax || "Any";
    chips.push({ label: `₹${min} – ₹${max}`, key: "price" });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground font-medium">Active:</span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => {
            if (chip.key === "price") {
              setFilters((p) => ({ ...p, priceMin: "", priceMax: "", page: 1 }));
            } else {
              setFilters((p) => ({ ...p, [chip.key]: "", page: 1 }));
            }
          }}
          className="group flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
        >
          {chip.label}
          <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               HELPERS                                      */
/* -------------------------------------------------------------------------- */

function getProductImage(product: {
  variants?: Array<{ images?: string[] }>;
}): string | null {
  return product.variants?.[0]?.images?.[0] ?? null;
}

/* -------------------------------------------------------------------------- */
/*                             PRODUCT CARD                                    */
/* -------------------------------------------------------------------------- */

function ProductCard({
  product,
  viewMode,
}: {
  product: any;
  viewMode: string;
}) {
  const img = getProductImage(product);
  const discount =
    product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  if (viewMode === "list") {
    return (
      <Card className="group overflow-hidden border-border/60 transition-all duration-300 hover:shadow-md hover:border-border">
        <Link href={`/products/${product._id}`}>
          <CardContent className="p-0">
            <div className="flex gap-4">
              <div className="relative h-40 w-36 shrink-0 overflow-hidden bg-muted sm:h-48 sm:w-44">
                {img ? (
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="180px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-8 w-8" />
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute left-2 top-2 bg-rose-500 text-[10px] px-1.5 py-0.5 font-semibold">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-3 pr-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category} · {product.subCategory}
                  </p>
                  <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {(product.averageRating > 0 || product.ratingCount > 0) && (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={product.averageRating || 0} size="sm" />
                      <span className="text-xs text-muted-foreground">
                        ({product.ratingCount})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-end justify-between pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-sm text-muted-foreground line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    );
  }

  // Grid view card
  return (
    <Card className="group overflow-hidden border-border/60 transition-all duration-300 hover:shadow-lg hover:border-border hover:-translate-y-0.5">
      <Link href={`/products/${product._id}`}>
        <CardContent className="p-0">
          {/* Image */}
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            {img ? (
              <Image
                src={img}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-10 w-10" />
              </div>
            )}

            {/* Overlays */}
            {product.label && (
              <div className="absolute left-3 top-3">
                <Badge className="bg-foreground/90 text-background text-[10px] px-2 py-0.5 font-medium backdrop-blur-sm">
                  <Sparkles className="mr-1 h-3 w-3" />
                  {product.label}
                </Badge>
              </div>
            )}
            {discount > 0 && (
              <div className="absolute right-3 top-3">
                <span className="inline-flex items-center rounded-md bg-rose-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                  {discount}% OFF
                </span>
              </div>
            )}

            {/* Quick Actions — visible on hover */}
            <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-3 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <Button
                size="sm"
                className="flex-1 h-9 bg-foreground text-background hover:bg-foreground/90 shadow-lg text-xs"
                onClick={(e) => e.preventDefault()}
              >
                <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-background/90 backdrop-blur-sm shadow-lg border-border/50"
                onClick={(e) => e.preventDefault()}
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 p-3 sm:p-4">
            <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {product.category} · {product.subCategory}
            </p>
            <h3 className="line-clamp-1 text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-2 pt-0.5">
              <span className="text-base font-bold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-muted-foreground line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[11px] font-semibold text-emerald-600">
                  Save {discount}%
                </span>
              )}
            </div>

            {(product.averageRating > 0 || product.ratingCount > 0) && (
              <div className="flex items-center gap-1.5 pt-0.5">
                <StarRating rating={product.averageRating || 0} size="sm" />
                <span className="text-[11px] text-muted-foreground">
                  {product.averageRating > 0
                    ? product.averageRating.toFixed(1)
                    : "0"}
                  {product.ratingCount > 0 && (
                    <span className="ml-0.5">({product.ratingCount})</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                               SKELETON CARD                                 */
/* -------------------------------------------------------------------------- */

function SkeletonCard() {
  return (
    <Card className="overflow-hidden border-border/60">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <CardContent className="p-3 sm:p-4 space-y-2.5">
        <div className="h-2.5 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/*                               PRODUCT LIST                                 */
/* -------------------------------------------------------------------------- */

export default function ProductList() {
  const [filters, setFilters] = useState<
    FetchProductsParams & { viewMode?: string }
  >({
    searchQuery: "",
    category: "",
    subCategory: "",
    design: "",
    priceMin: "",
    priceMax: "",
    rating: "",
    page: 1,
    limit: 12,
    viewMode: "grid",
  });

  const { data: productData, isLoading, error, refetch } = useProducts(filters);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    refetch();
  }, [filters, refetch]);

  /* ----------------------------- handlers -------------------------------- */

  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query, page: 1 }));
  };

  const handleApplyFilters = () => {
    refetch();
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ------------------------------ derived -------------------------------- */

  const typedProductData = productData as ProductListResult | undefined;
  const productsToDisplay = typedProductData?.products || [];
  const totalProducts = typedProductData?.total ?? productsToDisplay.length;
  const pageSize = typedProductData?.limit || filters.limit || 12;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl font-serif">
                Our Collection
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
                Explore timeless ethnic wear — handpicked kurtas, sarees, lehengas & more for every occasion.
              </p>
            </div>
            {!isLoading && totalProducts > 0 && (
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalProducts}</span>{" "}
                {totalProducts === 1 ? "product" : "products"} found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="sticky top-6">
              <FilterSection
                filters={filters}
                setFilters={setFilters}
                onApplyFilters={handleApplyFilters}
              />
            </div>
          </aside>

          {/* Products Area */}
          <main className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {/* Mobile filter trigger */}
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger>
                    <Button
                      variant="outline"
                      size="sm"
                      className="lg:hidden h-9"
                    >
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 sm:w-96">
                    <SheetHeader>
                      <SheetTitle className="text-base">Filters</SheetTitle>
                    </SheetHeader>
                    <ScrollArea className="h-[calc(100vh-6rem)] pr-4">
                      <div className="py-4">
                        <FilterSection
                          filters={filters}
                          setFilters={setFilters}
                          onApplyFilters={handleApplyFilters}
                        />
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>

                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={filters.searchQuery || ""}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="h-9 pl-10 text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Sort (hidden for now – can wire up later) */}
                <Select defaultValue="newest">
                  <SelectTrigger className="h-9 w-[160px] text-xs hidden sm:flex" aria-label="Sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View toggle */}
                <ToggleGroup
                  value={[filters.viewMode || "grid"]}
                  onValueChange={(values) => {
                    const next = values?.[0];
                    if (next) setFilters((prev) => ({ ...prev, viewMode: next }));
                  }}
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view" className="h-9 w-9 p-0">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view" className="h-9 w-9 p-0">
                    <LayoutList className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Active filter chips */}
            <ActiveFilters filters={filters} setFilters={setFilters} />

            {/* Product count on mobile */}
            {!isLoading && totalProducts > 0 && (
              <div className="mb-4 mt-2 flex items-center justify-between text-xs text-muted-foreground sm:text-sm">
                <span>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {((filters.page ?? 1) - 1) * pageSize + 1}
                  </span>{" "}
                  –{" "}
                  <span className="font-medium text-foreground">
                    {Math.min((filters.page ?? 1) * pageSize, totalProducts)}
                  </span>{" "}
                  of {totalProducts}
                </span>
              </div>
            )}

            {/* Product Grid */}
            {error ? (
              <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-10 text-center">
                <p className="text-destructive text-sm">{error.message}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => refetch()}
                >
                  Retry
                </Button>
              </div>
            ) : isLoading && productsToDisplay.length === 0 ? (
              <div
                className={cn(
                  "grid gap-4 sm:gap-5",
                  filters.viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {[...Array(8)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : productsToDisplay.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <Search className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="text-base font-medium text-foreground">
                  No products found
                </h3>
                <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                  We couldn't find any products matching your filters. Try
                  adjusting your search or clearing filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-5"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      searchQuery: "",
                      category: "",
                      subCategory: "",
                      design: "",
                      priceMin: "",
                      priceMax: "",
                      rating: "",
                      page: 1,
                    })
                  }
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div
                className={cn(
                  "grid gap-4 sm:gap-5",
                  filters.viewMode === "grid"
                    ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                )}
              >
                {productsToDisplay.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={filters.viewMode || "grid"}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if ((filters.page || 1) > 1) {
                            handlePageChange((filters.page || 1) - 1);
                          }
                        }}
                        className={cn(
                          (filters.page || 1) <= 1 &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(i + 1);
                          }}
                          isActive={(filters.page || 1) === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if ((filters.page || 1) < totalPages) {
                            handlePageChange((filters.page || 1) + 1);
                          }
                        }}
                        className={cn(
                          (filters.page || 1) >= totalPages &&
                            "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
