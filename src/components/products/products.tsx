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
  { value: "4", label: "4+ Stars" },
  { value: "3", label: "3+ Stars" },
  { value: "2", label: "2+ Stars" },
  { value: "1", label: "1+ Stars" },
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

        return <Star key={starIndex} className={cn(sizeClass, emptyColor)} />;
      })}
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
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Filters</h3>
          <p className="text-muted-foreground mt-1 text-xs">
            Refine products by category, design, price & rating.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs px-2 text-muted-foreground hover:text-foreground"
          onClick={resetFilters}
        >
          <X className="mr-1 h-3 w-3" />
          Clear all
        </Button>
      </div>

      {/* Category */}
      <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Category
        </Label>
        <Select
          value={filters.category || ""}
          onValueChange={(v) => handleFilterChange("category", v)}
        >
          <SelectTrigger className="h-9" aria-label="Category">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value || "all"} value={c.value || ""}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.filter((c) => c.value).map((c) => (
            <Button
              key={c.value}
              type="button"
              size="sm"
              variant={filters.category === c.value ? "default" : "outline"}
              className="h-7 rounded-full px-3 text-xs"
              onClick={() => handleFilterChange("category", c.value)}
            >
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sub Category */}
      <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Sub Category
        </Label>
        <Input
          className="h-9"
          placeholder="e.g. Kurta, Shirt"
          value={filters.subCategory || ""}
          onChange={(e) => handleFilterChange("subCategory", e.target.value)}
        />
      </div>

      {/* Design */}
      <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Design
        </Label>
        <Select
          value={filters.design || ""}
          onValueChange={(v) => handleFilterChange("design", v)}
        >
          <SelectTrigger className="h-9" aria-label="Design">
            <SelectValue placeholder="All designs" />
          </SelectTrigger>
          <SelectContent>
            {DESIGNS.map((d) => (
              <SelectItem key={d.value || "all"} value={d.value || ""}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating */}
      <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Rating
        </Label>
        <Select
          value={filters.rating || ""}
          onValueChange={(v) => handleFilterChange("rating", v)}
        >
          <SelectTrigger className="h-9" aria-label="Rating">
            <SelectValue placeholder="Any rating" />
          </SelectTrigger>
          <SelectContent>
            {RATINGS.map((r) => (
              <SelectItem key={r.value || "all"} value={r.value || ""}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price */}
      <div className="space-y-3 rounded-lg border bg-muted/40 p-3">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Price Range (₹)
          </Label>
          <span className="text-muted-foreground text-[11px]">
            Set a minimum & maximum budget
          </span>
        </div>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            className="h-9"
            placeholder="Min"
            value={filters.priceMin || ""}
            onChange={(e) => handleFilterChange("priceMin", e.target.value)}
          />
          <Input
            type="number"
            min={0}
            className="h-9"
            placeholder="Max"
            value={filters.priceMax || ""}
            onChange={(e) => handleFilterChange("priceMax", e.target.value)}
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="mt-1 w-full"
          onClick={onApplyFilters}
        >
          Apply price filter
        </Button>
      </div>
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
    setFilters((prev) => ({
      ...prev,
      searchQuery: query,
      page: 1,
    }));
  };

  const handleApplyFilters = () => {
    refetch();
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  /* ----------------------------- render ---------------------------------- */

  const typedProductData = productData as ProductListResult | undefined;

  const productsToDisplay = typedProductData?.products || [];
  const totalProducts = typedProductData?.total ?? productsToDisplay.length;
  const pageSize = typedProductData?.limit || filters.limit || 12;
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize));

  return (
    <div className="px-4 py-4 sm:py-8">
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-4 rounded-xl border bg-card/80 p-4 shadow-sm backdrop-blur">
            <FilterSection
              filters={filters}
              setFilters={setFilters}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <div className="mb-4 flex flex-col gap-4 sm:mb-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  Shop all products
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  Discover curated styles across men, women & kids.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                {!isLoading && totalProducts > 0 && (
                  <span className="rounded-full bg-muted px-3 py-1">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {(((filters.page ?? 1) - 1) * pageSize) + 1}
                    </span>{" "}
                    -{" "}
                    <span className="font-medium text-foreground">
                      {Math.min((filters.page ?? 1) * pageSize, totalProducts)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {totalProducts}
                    </span>{" "}
                    items
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-card/70 px-3 py-2.5 sm:px-4 sm:py-3">
              <div className="flex items-center gap-3">
                <Sheet
                  open={mobileFiltersOpen}
                  onOpenChange={setMobileFiltersOpen}
                >
                  <SheetTrigger>
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
                        <FilterSection
                          filters={filters}
                          setFilters={setFilters}
                          onApplyFilters={handleApplyFilters}
                        />
                      </div>
                    </ScrollArea>
                  </SheetContent>
                </Sheet>
                <span className="text-muted-foreground text-xs sm:text-sm">
                  {isLoading
                    ? "Fetching the latest styles..."
                    : `${totalProducts} products`}
                </span>
              </div>
              <ToggleGroup
                value={[filters.viewMode || "grid"]}
                onValueChange={(values) => {
                  const next = values?.[0];
                  if (next) setFilters((prev) => ({ ...prev, viewMode: next }));
                }}
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
                  value={filters.searchQuery || ""}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <ToggleGroup
                value={[filters.viewMode || "grid"]}
                onValueChange={(values) => {
                  const next = values?.[0];
                  if (next) setFilters((prev) => ({ ...prev, viewMode: next }));
                }}
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
              <p className="text-destructive">{error.message}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : isLoading && productsToDisplay.length === 0 ? (
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
          ) : productsToDisplay.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-muted-foreground text-lg">
                No products found matching your filters.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Try adjusting your search or filters.
              </p>
              <Button
                variant="outline"
                className="mt-4"
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
                  })
                }
              >
                View All Products
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "grid gap-4 sm:gap-6",
                filters.viewMode === "grid"
                  ? "xs:grid-cols-2 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1",
              )}
            >
              {productsToDisplay.map((product) => {
                const img = getProductImage(product);
                const discount =
                  product.mrp > product.price
                    ? Math.round(
                        ((product.mrp - product.price) / product.mrp) * 100,
                      )
                    : 0;

                return (
                  <Card
                    key={product._id}
                    className="group overflow-hidden transition-shadow hover:shadow-lg"
                  >
                    <Link href={`/products/${product._id}`}>
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
                          {(product.averageRating > 0 ||
                            product.ratingCount > 0) && (
                            <div className="flex items-center gap-1.5">
                              <StarRating
                                rating={product.averageRating || 0}
                                size="sm"
                              />
                              <span className="text-muted-foreground text-xs">
                                {product.averageRating > 0
                                  ? product.averageRating.toFixed(1)
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
                              <span className="hidden xs:inline">
                                Add to cart
                              </span>
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
          {totalPages > 1 && (
            <Pagination className="mt-8">
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
                        "pointer-events-none opacity-50",
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
                        "pointer-events-none opacity-50",
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </main>
      </div>
    </div>
  );
}
