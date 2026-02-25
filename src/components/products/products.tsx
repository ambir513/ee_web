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
  Palette,
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
  SheetFooter,
  SheetDescription,
  SheetClose,
  SheetPanel,
} from "@/components/ui/sheet";
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
  icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/40 pb-4 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-1.5 text-[13px] sm:text-sm font-semibold text-foreground hover:text-primary transition-colors active:scale-[0.98]"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform" />
        )}
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-250 ease-out",
          isOpen ? "mt-3 max-h-[600px] opacity-100" : "max-h-0 opacity-0"
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-[2px] w-5 bg-primary/60 rounded-full" />
          <h3 className="text-xs font-semibold tracking-[0.15em] uppercase text-foreground/80">Refine By</h3>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-[11px] font-medium text-rose-500 hover:text-rose-600 transition-colors bg-rose-50 dark:bg-rose-950/20 rounded-full px-2.5 py-1 active:scale-95"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      <Separator className="!mt-2" />

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
                "rounded-full border h-9 px-4 text-[13px] font-medium transition-all duration-150 active:scale-95",
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
          className="h-10 text-sm rounded-lg"
          placeholder="e.g. Kurta, Saree, Lehenga"
          value={filters.subCategory || ""}
          onChange={(e) => handleFilterChange("subCategory", e.target.value)}
        />
      </FilterGroup>

      {/* Design */}
      <FilterGroup title="Design / Pattern" icon={<Palette className="h-3.5 w-3.5 text-muted-foreground" />}>
        <div className="flex flex-wrap gap-2">
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
                "rounded-lg border px-3 min-h-[34px] text-xs font-medium transition-all duration-150 active:scale-95",
                filters.design === d.value
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50"
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Rating */}
      <FilterGroup title="Customer Rating" defaultOpen={false}>
        <div className="flex flex-col gap-1">
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
                "flex items-center gap-2.5 rounded-lg px-3 min-h-[40px] text-xs transition-all active:scale-[0.98]",
                filters.rating === r.value
                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <StarRating rating={parseInt(r.value)} size="sm" />
              <span className="font-medium">{r.label}</span>
            </button>
          ))}
        </div>
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup title="Price Range">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block font-semibold">
                Min (₹)
              </Label>
              <Input
                type="number"
                min={0}
                className="h-10 text-sm rounded-lg"
                placeholder="0"
                value={filters.priceMin || ""}
                onChange={(e) =>
                  handleFilterChange("priceMin", e.target.value)
                }
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block font-semibold">
                Max (₹)
              </Label>
              <Input
                type="number"
                min={0}
                className="h-10 text-sm rounded-lg"
                placeholder="Any"
                value={filters.priceMax || ""}
                onChange={(e) =>
                  handleFilterChange("priceMax", e.target.value)
                }
              />
            </div>
          </div>
          {/* Quick price presets */}
          <div className="flex flex-wrap gap-2">
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
                  "rounded-lg border px-3 min-h-[34px] text-xs font-medium transition-all active:scale-95",
                  filters.priceMin === preset.min &&
                    filters.priceMax === preset.max
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground hover:bg-muted/50"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full h-10 text-xs rounded-lg"
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
            <div className="flex gap-3 sm:gap-4">
              <div className="relative h-36 w-28 shrink-0 overflow-hidden bg-muted rounded-l-lg sm:h-48 sm:w-44">
                {img ? (
                  <Image
                    src={img}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 112px, 176px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <Package className="h-7 w-7 sm:h-8 sm:w-8" />
                  </div>
                )}
                {discount > 0 && (
                  <Badge className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 bg-rose-500 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 font-semibold">
                    {discount}% OFF
                  </Badge>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-2.5 pr-3 sm:py-3 sm:pr-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <p className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {product.category} · {product.subCategory}
                  </p>
                  <h3 className="text-xs sm:text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                  {(product.averageRating > 0 || product.ratingCount > 0) && (
                    <div className="flex items-center gap-1.5">
                      <StarRating rating={product.averageRating || 0} size="sm" />
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        ({product.ratingCount})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 pt-1.5 sm:flex-row sm:items-end sm:justify-between sm:pt-2">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-[11px] sm:text-sm text-muted-foreground line-through">
                        ₹{product.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="h-7 sm:h-8 text-[11px] sm:text-xs px-2.5 sm:px-3"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ShoppingCart className="mr-1 h-3 w-3 sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 sm:h-8 sm:w-8"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
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
    <Card className="group overflow-hidden border-border/60 rounded-lg sm:rounded-xl transition-all duration-300 hover:shadow-lg hover:border-border hover:-translate-y-0.5">
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
                sizes="(max-width: 480px) 47vw, (max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Package className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            )}

            {/* Overlays */}
            {product.label && (
              <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
                <Badge className="bg-foreground/90 text-background text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 font-medium backdrop-blur-sm">
                  <Sparkles className="mr-0.5 sm:mr-1 h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {product.label}
                </Badge>
              </div>
            )}
            {discount > 0 && (
              <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
                <span className="inline-flex items-center rounded-md bg-rose-500 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white shadow-sm">
                  {discount}% OFF
                </span>
              </div>
            )}

            {/* Wishlist — always visible on mobile, hover on desktop */}
            <button
              className="absolute right-2 bottom-2 sm:right-3 sm:bottom-3 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-sm shadow-md border border-white/20 transition-all duration-200 hover:bg-white hover:scale-110 active:scale-95 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0"
              onClick={(e) => e.preventDefault()}
              aria-label="Add to wishlist"
            >
              <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-foreground/70" />
            </button>
          </div>

          {/* Details */}
          <div className="space-y-1 sm:space-y-1.5 p-2.5 sm:p-4">
            <p className="text-[9px] sm:text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground truncate">
              {product.category} · {product.subCategory}
            </p>
            <h3 className="line-clamp-1 text-[13px] sm:text-sm font-medium leading-snug text-foreground group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-baseline gap-1.5 sm:gap-2 pt-0.5">
              <span className="text-sm sm:text-base font-bold text-foreground">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.mrp > product.price && (
                <span className="text-[10px] sm:text-xs text-muted-foreground line-through">
                  ₹{product.mrp.toLocaleString("en-IN")}
                </span>
              )}
              {discount > 0 && (
                <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-600">
                  {discount}% off
                </span>
              )}
            </div>

            {(product.averageRating > 0 || product.ratingCount > 0) && (
              <div className="flex items-center gap-1 sm:gap-1.5 pt-0.5">
                <StarRating rating={product.averageRating || 0} size="sm" />
                <span className="text-[10px] sm:text-[11px] text-muted-foreground">
                  {product.averageRating > 0
                    ? product.averageRating.toFixed(1)
                    : "0"}
                  {product.ratingCount > 0 && (
                    <span className="ml-0.5">({product.ratingCount})</span>
                  )}
                </span>
              </div>
            )}

            {/* Mobile Add-to-Cart — always visible on touch devices */}
            <div className="pt-1.5 sm:hidden">
              <Button
                size="sm"
                className="w-full h-8 text-[11px] font-medium bg-foreground text-background hover:bg-foreground/90"
                onClick={(e) => e.preventDefault()}
              >
                <ShoppingCart className="mr-1.5 h-3 w-3" />
                Add to Bag
              </Button>
            </div>
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
    <Card className="overflow-hidden border-border/60 rounded-lg sm:rounded-xl">
      <div className="aspect-[3/4] animate-pulse bg-muted" />
      <CardContent className="p-2.5 sm:p-4 space-y-2">
        <div className="h-2 w-14 sm:h-2.5 sm:w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-3.5 sm:h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 sm:h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-2.5 sm:h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-8 w-full animate-pulse rounded bg-muted sm:hidden" />
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
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-10 lg:px-8">
          <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <span className="inline-block h-[2px] w-6 sm:w-8 bg-primary/70 rounded-full" />
                <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-primary/80">
                  Curated for You
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight font-serif">
                Our Collection
              </h1>
              <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
                Explore timeless ethnic wear — handpicked kurtas, sarees, lehengas & more for every occasion.
              </p>
            </div>
            {!isLoading && totalProducts > 0 && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{totalProducts}</span>{" "}
                {totalProducts === 1 ? "product" : "products"} found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="flex gap-6 lg:gap-8">
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
            <div className="mb-4 sm:mb-5 space-y-3">
              {/* Search — full width on mobile */}
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search kurtas, sarees, lehengas..."
                  value={filters.searchQuery || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-9 sm:h-10 pl-10 text-xs sm:text-sm rounded-lg"
                />
              </div>

              {/* Filter / Sort / View row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Mobile filter trigger */}
                  <Sheet
                    open={mobileFiltersOpen}
                    onOpenChange={setMobileFiltersOpen}
                  >
                    <SheetTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="lg:hidden h-8 sm:h-9 text-[11px] sm:text-xs gap-1.5 px-2.5 sm:px-3 rounded-lg"
                        />
                      }
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      Filters
                      {(() => {
                        const count = [
                          filters.category,
                          filters.subCategory,
                          filters.design,
                          filters.priceMin,
                          filters.priceMax,
                          filters.rating,
                        ].filter(Boolean).length;
                        return count > 0 ? (
                          <span className="ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground px-1">
                            {count}
                          </span>
                        ) : null;
                      })()}
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[88vw] max-w-[380px] sm:w-96 p-0">
                      <SheetHeader className="px-5 pt-5 pb-3">
                        <SheetTitle className="text-lg font-semibold tracking-tight">
                          Refine Your Style
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                          Narrow down from{" "}
                          <span className="font-medium text-foreground">
                            {typedProductData?.total ?? "..."}
                          </span>{" "}
                          styles to find your perfect match.
                        </SheetDescription>
                      </SheetHeader>

                      <Separator />

                      <SheetPanel className="px-5 py-4">
                        <FilterSection
                          filters={filters}
                          setFilters={setFilters}
                          onApplyFilters={handleApplyFilters}
                        />
                      </SheetPanel>

                      <SheetFooter className="px-5 py-4 border-t bg-muted/30 gap-3 flex-row">
                        <Button
                          variant="outline"
                          className="flex-1 h-11 text-xs font-medium rounded-lg"
                          onClick={() => {
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
                              viewMode: filters.viewMode,
                            });
                          }}
                        >
                          <X className="mr-1.5 h-3.5 w-3.5" />
                          Clear All
                        </Button>
                        <SheetClose
                          render={
                            <Button
                              className="flex-[2] h-11 text-sm font-semibold rounded-lg shadow-sm"
                            />
                          }
                          onClick={() => {
                            handleApplyFilters();
                          }}
                        >
                          Show{typedProductData?.total ? ` ${typedProductData.total}` : ""} Results
                        </SheetClose>
                      </SheetFooter>
                    </SheetContent>
                  </Sheet>

                  {/* Sort — visible on all devices */}
                  <Select defaultValue="newest">
                    <SelectTrigger className="h-8 sm:h-9 w-[130px] sm:w-[160px] text-[11px] sm:text-xs" aria-label="Sort">
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
                </div>

                {/* View toggle */}
                <ToggleGroup
                  value={[filters.viewMode || "grid"]}
                  onValueChange={(values) => {
                    const next = values?.[0];
                    if (next) setFilters((prev) => ({ ...prev, viewMode: next }));
                  }}
                >
                  <ToggleGroupItem value="grid" aria-label="Grid view" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <Grid3X3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" aria-label="List view" className="h-8 w-8 sm:h-9 sm:w-9 p-0">
                    <LayoutList className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>

            {/* Active filter chips */}
            <ActiveFilters filters={filters} setFilters={setFilters} />

            {/* Product count */}
            {!isLoading && totalProducts > 0 && (
              <div className="mb-3 sm:mb-4 mt-1 flex items-center justify-between text-[11px] sm:text-xs text-muted-foreground">
                <span>
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {((filters.page ?? 1) - 1) * pageSize + 1}
                  </span>
                  {"–"}
                  <span className="font-medium text-foreground">
                    {Math.min((filters.page ?? 1) * pageSize, totalProducts)}
                  </span>{" "}
                  of {totalProducts} styles
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
                  "grid gap-3 sm:gap-4 lg:gap-5",
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
                  "grid gap-3 sm:gap-4 lg:gap-5",
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
              <div className="mt-8 sm:mt-10 flex justify-center">
                <Pagination>
                  <PaginationContent className="gap-0.5 sm:gap-1">
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
                          "h-8 sm:h-9 px-2 sm:px-3 text-xs",
                          (filters.page || 1) <= 1 &&
                          "pointer-events-none opacity-50"
                        )}
                      />
                    </PaginationItem>
                    {(() => {
                      const currentPage = filters.page || 1;
                      const pages: (number | "ellipsis")[] = [];

                      if (totalPages <= 5) {
                        // Show all pages
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        // Always show first page
                        pages.push(1);
                        if (currentPage > 3) pages.push("ellipsis");
                        // Pages around current
                        const start = Math.max(2, currentPage - 1);
                        const end = Math.min(totalPages - 1, currentPage + 1);
                        for (let i = start; i <= end; i++) pages.push(i);
                        if (currentPage < totalPages - 2) pages.push("ellipsis");
                        // Always show last page
                        pages.push(totalPages);
                      }

                      return pages.map((page, idx) =>
                        page === "ellipsis" ? (
                          <PaginationItem key={`ellipsis-${idx}`}>
                            <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center text-xs text-muted-foreground">
                              …
                            </span>
                          </PaginationItem>
                        ) : (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={currentPage === page}
                              className="h-8 w-8 sm:h-9 sm:w-9 text-xs p-0"
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        )
                      );
                    })()}
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
                          "h-8 sm:h-9 px-2 sm:px-3 text-xs",
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
