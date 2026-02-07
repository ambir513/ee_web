"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, Radio } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Search,
  LayoutGrid,
  List,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type {
  Product,
  ProductFilterParams,
  ProductFilterResponse,
} from "@/types/product";

const DEFAULT_CATEGORIES = ["All", "Kurta", "Saree", "Lehenga", "Dupatta", "Others"];
const DEFAULT_DESIGNS = ["Ethnic", "Printed", "Embroidered", "Solid", "Party", "Casual"];
const COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Orange", hex: "#f97316" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#fafafa" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Gray", hex: "#737373" },
];

const PRICE_MAX = 10000;

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>
          {i < full ? "★" : i === full && hasHalf ? "★" : "☆"}
        </span>
      ))}
      <span className="ml-1 text-foreground text-sm">
        {rating > 0 ? rating.toFixed(1) : "–"}
      </span>
    </span>
  );
}

function buildFilterParams(
  category: string,
  design: string,
  colors: string[],
  priceRange: [number, number],
  search: string,
  page: number,
): ProductFilterParams {
  const params: ProductFilterParams = {
    page,
    limit: 12,
    priceMin: priceRange[0],
    priceMax: priceRange[1],
  };
  if (category && category !== "All") params.category = category;
  if (design) params.design = design;
  if (colors.length) params.color = colors[0];
  if (search.trim()) params.search = search.trim();
  return params;
}

export function ProductList() {
  const [category, setCategory] = useState("All");
  const [design, setDesign] = useState("");
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, PRICE_MAX]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filterParams = useMemo(
    () =>
      buildFilterParams(
        category,
        design,
        selectedColors,
        priceRange,
        search,
        page,
      ),
    [category, design, selectedColors, priceRange, search, page],
  );

  const queryString = useMemo(() => {
    const sp = new URLSearchParams();
    Object.entries(filterParams).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
    });
    return sp.toString();
  }, [filterParams]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["product-filter", queryString],
    queryFn: async (): Promise<ProductFilterResponse> => {
      const res = await api.get(`/product/filter?${queryString}`);
      return res as ProductFilterResponse;
    },
  });

  const products = data?.data?.products ?? [];
  const total = data?.data?.total ?? 0;

  const toggleColor = (colorName: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((c) => c !== colorName)
        : [...prev, colorName],
    );
    setPage(1);
  };

  const toggleDesign = (d: string) => {
    setDesign((prev) => (prev === d ? "" : d));
    setPage(1);
  };

  const discount = (price: number, original: number) =>
    Math.round(((original - price) / original) * 100);

  const applyFilters = () => setPage(1);

  return (
    <div className="flex min-h-[80vh] w-full gap-8 p-6">
      {/* Left sidebar - Filters */}
      <aside className="w-56 shrink-0 space-y-6 border-r border-border pr-6">
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Related categories:
          </h3>
          <RadioGroup
            value={category}
            onValueChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
            className="flex flex-col gap-1.5"
          >
            {DEFAULT_CATEGORIES.map((c) => (
              <Label
                key={c}
                className="flex cursor-pointer items-center gap-2 font-normal"
              >
                <Radio value={c} />
                <span className="text-sm">{c}</span>
              </Label>
            ))}
          </RadioGroup>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Design:
          </h3>
          <div className="flex flex-col gap-2">
            {DEFAULT_DESIGNS.map((d) => (
              <Label
                key={d}
                className="flex cursor-pointer items-center gap-2 font-normal"
              >
                <Checkbox
                  checked={design === d}
                  onCheckedChange={() => toggleDesign(d)}
                />
                <span className="text-sm">{d}</span>
              </Label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Colors:
          </h3>
          <div className="flex flex-col gap-2">
            {COLORS.map((color) => (
              <Label
                key={color.name}
                className="flex cursor-pointer items-center gap-2 font-normal"
              >
                <Checkbox
                  checked={selectedColors.includes(color.name)}
                  onCheckedChange={() => toggleColor(color.name)}
                />
                <span
                  className="size-4 rounded-full border border-border"
                  style={{ backgroundColor: color.hex }}
                  aria-hidden
                />
                <span className="text-sm">{color.name}</span>
              </Label>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Price:</h3>
          <Slider
            min={0}
            max={PRICE_MAX}
            step={100}
            value={priceRange}
            onValueChange={(v) => setPriceRange(v as [number, number])}
            onValueCommitted={applyFilters}
            className="mb-3"
          />
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="From"
              min={0}
              max={PRICE_MAX}
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange((prev) => [
                  Math.min(PRICE_MAX, Math.max(0, Number(e.target.value) || 0)),
                  prev[1],
                ])
              }
              onBlur={applyFilters}
              className="h-8 w-20 text-sm"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              placeholder="To"
              min={0}
              max={PRICE_MAX}
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange((prev) => [
                  prev[0],
                  Math.min(
                    PRICE_MAX,
                    Math.max(0, Number(e.target.value) || PRICE_MAX),
                  ),
                ])
              }
              onBlur={applyFilters}
              className="h-8 w-20 text-sm"
            />
          </div>
        </section>
      </aside>

      {/* Main content - Products */}
      <main className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            {total} product{total !== 1 ? "s" : ""}
          </span>
          <div className="flex flex-1 items-center justify-center gap-2 px-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setPage(1)}
                className="h-9 pl-9"
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className="size-9"
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("list")}
              className="size-9"
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="aspect-square bg-muted" />
                <CardContent className="space-y-2 p-4">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error instanceof Error ? error.message : "Failed to load products"}
          </div>
        )}

        {!isLoading && !isError && (
          <div
            className={cn(
              "grid gap-4",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1",
            )}
          >
            {products.length === 0 ? (
              <p className="col-span-full py-12 text-center text-muted-foreground">
                No products found. Try adjusting filters or search.
              </p>
            ) : (
              products.map((product: Product) => (
                <ProductCard
                  key={product._id}
                  product={product}
                  viewMode={viewMode}
                  discount={discount}
                />
              ))
            )}
          </div>
        )}

        {!isLoading && !isError && total > 12 && (
          <div className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <span className="flex items-center px-2 text-sm text-muted-foreground">
              Page {page} of {Math.ceil(total / 12)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= Math.ceil(total / 12)}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function ProductCard({
  product,
  viewMode,
  discount: calcDiscount,
}: {
  product: Product;
  viewMode: "grid" | "list";
  discount: (price: number, original: number) => number;
}) {
  const imageUrl =
    product.variants?.[0]?.images?.[0] ?? null;
  const hasDiscount = product.mrp > product.price;

  return (
    <Card
      className={cn(
        "overflow-hidden transition-shadow hover:shadow-md",
        viewMode === "list" && "flex flex-row",
      )}
    >
      <CardHeader className="relative p-0">
        <div
          className={cn(
            "flex items-center justify-center bg-muted text-muted-foreground overflow-hidden",
            viewMode === "grid" ? "aspect-square" : "h-32 w-40 shrink-0",
          )}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>Image</span>
          )}
        </div>
        {product.label && (
          <Badge className="absolute left-2 top-2 bg-red-500 text-white hover:bg-red-600">
            {product.label}
          </Badge>
        )}
      </CardHeader>
      <CardContent
        className={cn(
          "flex flex-1 flex-col gap-2 p-4",
          viewMode === "list" && "justify-center",
        )}
      >
        <h3 className="line-clamp-2 font-medium text-foreground">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-blue-600">
            ₹{product.price.toFixed(2)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.mrp.toFixed(2)}
              </span>
              <Badge variant="destructive" className="text-xs font-medium">
                -{calcDiscount(product.price, product.mrp)}%
              </Badge>
            </>
          )}
        </div>
        <StarRating rating={product.averageRating ?? 0} />
        {product.ratingCount != null && product.ratingCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {product.ratingCount} review{product.ratingCount !== 1 ? "s" : ""}
          </p>
        )}
        <div className="mt-2 flex gap-2">
          <Button size="sm" className="flex-1 gap-1.5">
            <ShoppingCart className="size-4" />
            Add
          </Button>
          <Button variant="outline" size="icon">
            <Heart className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
