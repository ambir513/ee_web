"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Review_04 from "@/components/commerce-ui/review-04";
import { Header } from "@/components/landing/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Product as ApiProduct } from "@/types/product";
import {
  Star,
  X,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  ChevronRight,
  ChevronDown,
  Share2,
  Check,
  Package,
  Sparkles,
} from "lucide-react";

/* ========================================================================== */
/* TYPES & CONSTANTS */
/* ========================================================================== */

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

type ProductWithReviews = ApiProduct & {
  review?: Array<any>;
};

const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.2;
const ZOOM_SCROLL_STEP = 0.1;
const IMAGE_QUALITY = 90;
const THUMBNAIL_QUALITY = 75;

const isValidObjectId = (value?: string): value is string =>
  typeof value === "string" && MONGO_ID_REGEX.test(value);

/* ========================================================================== */
/* IMAGE ZOOM VIEWER COMPONENT */
/* ========================================================================== */

interface ImageZoomViewerProps {
  imageSrc: string;
  isOpen: boolean;
  onClose: () => void;
}

function ImageZoomViewer({ imageSrc, isOpen, onClose }: ImageZoomViewerProps) {
  const [zoom, setZoom] = useState(ZOOM_MIN);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoom((prev) => {
        const newZoom =
          e.deltaY > 0 ? prev - ZOOM_SCROLL_STEP : prev + ZOOM_SCROLL_STEP;
        return Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX));
      });
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, [isOpen]);

  const handleZoom = useCallback((direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev + ZOOM_STEP : prev - ZOOM_STEP;
      return Math.max(ZOOM_MIN, Math.min(newZoom, ZOOM_MAX));
    });
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom === ZOOM_MIN) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [zoom, position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || zoom === ZOOM_MIN) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, zoom, dragStart],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  const handleReset = useCallback(() => {
    setZoom(ZOOM_MIN);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleClose = useCallback(() => {
    setZoom(ZOOM_MIN);
    setPosition({ x: 0, y: 0 });
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  const zoomPercentage = Math.round(zoom * 100);
  const isMagnified = zoom > ZOOM_MIN;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image zoom viewer"
    >
      <div
        ref={containerRef}
        className="relative flex h-[90vh] w-[90vw] max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-xl bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="transition-transform duration-75 will-change-transform"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
            cursor: isMagnified
              ? isDragging
                ? "grabbing"
                : "grab"
              : "default",
          }}
        >
          <Image
            src={imageSrc}
            alt="Zoomed product image"
            width={800}
            height={800}
            priority
            quality={100}
            className="object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-md">
          <button
            onClick={(e) => { e.stopPropagation(); handleZoom("in"); }}
            disabled={zoom >= ZOOM_MAX}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
          <div className="w-10 text-center text-xs font-medium text-white">{zoomPercentage}%</div>
          <button
            onClick={(e) => { e.stopPropagation(); handleZoom("out"); }}
            disabled={zoom <= ZOOM_MIN}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          {isMagnified && (
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="mt-1 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium text-white transition-all hover:bg-white/30"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <div className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {isMagnified ? "Drag to pan · Scroll to zoom" : "Scroll to zoom"}
          </div>
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 backdrop-blur-md"
            aria-label="Close image viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* ACCORDION ITEM */
/* ========================================================================== */

function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border/60">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-4 text-sm font-medium text-foreground hover:text-primary transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[600px] opacity-100 pb-4" : "max-h-0 opacity-0"
        )}
      >
        {children}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TRUST BADGES */
/* ========================================================================== */

function TrustBadges() {
  const badges = [
    { icon: Truck, label: "Free Shipping", desc: "On orders above ₹999" },
    { icon: RotateCcw, label: "Easy Returns", desc: "7-day return policy" },
    { icon: ShieldCheck, label: "Authentic", desc: "100% genuine product" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-muted/30 p-3 text-center"
        >
          <badge.icon className="h-5 w-5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground leading-tight">
            {badge.label}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight">
            {badge.desc}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ========================================================================== */
/* SKELETON LOADER */
/* ========================================================================== */

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Image skeleton */}
        <div className="space-y-4">
          <div className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 w-20 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        </div>
        {/* Details skeleton */}
        <div className="space-y-6 pt-2">
          <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-10 w-40 animate-pulse rounded bg-muted" />
          <div className="h-px w-full bg-muted" />
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 w-10 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
          <div className="h-4 w-12 animate-pulse rounded bg-muted" />
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-11 w-14 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-muted" />
            <div className="h-12 flex-1 animate-pulse rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* MAIN PRODUCT PAGE COMPONENT */
/* ========================================================================== */

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const [selectedVariant, setSelectedVariant] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  /* ======================================================================= */
  /* FETCH PRODUCT */
  /* ======================================================================= */

  const { 
    data: productResponse, 
    isLoading: isProductLoading, 
    error: productError,
    refetch
  } = useQuery({
    queryKey: ["product", id],
    queryFn: () => api.get<{
      status: boolean;
      message?: string;
      data?: ProductWithReviews;
    }>(`/product/${encodeURIComponent(id)}`),
    enabled: isValidObjectId(id),
  });

  const product = productResponse?.data || null;
  const isLoading = isProductLoading;
  const error = productError ? (productError as Error).message : (productResponse?.status === false ? productResponse.message : null);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants?.[0]?.color);
      setSelectedSize(product.variants?.[0]?.size?.[0]?.size || null);
    }
  }, [product]);

  /* ======================================================================= */
  /* MEMOIZED COMPUTATIONS */
  /* ======================================================================= */

  const galleryImages = useMemo(() => {
    if (!product) return [] as string[];
    const set = new Set<string>();
    product.variants?.forEach((variant) => {
      variant.images?.forEach((img) => img && set.add(img));
    });
    return Array.from(set);
  }, [product]);

  const colorOptions = useMemo(() => {
    if (!product) return [] as string[];
    const set = new Set<string>();
    product.variants?.forEach(
      (variant) => variant.color && set.add(variant.color),
    );
    return Array.from(set);
  }, [product]);

  const sizeOptions = useMemo(() => {
    if (!product?.variants?.length) return [] as string[];
    const variantForColor =
      (selectedVariant &&
        product.variants.find(
          (variant) => variant.color === selectedVariant,
        )) ||
      product.variants[0];
    return (variantForColor.size ?? []).map((s) => s.size).filter(Boolean);
  }, [product, selectedVariant]);

  const activeVariant = useMemo(() => {
    if (!product?.variants?.length) return undefined;
    return (
      product.variants.find((v) => v.color === selectedVariant) ||
      product.variants[0]
    );
  }, [product, selectedVariant]);

  const selectedSizeStock = useMemo(() => {
    if (!activeVariant) return 0;
    if (selectedSize) {
      return (
        activeVariant.size?.find((s) => s.size === selectedSize)?.stock ?? 0
      );
    }
    return activeVariant.size?.reduce((sum, s) => sum + (s.stock ?? 0), 0) ?? 0;
  }, [activeVariant, selectedSize]);

  const isInStock = !!product?.isActive && selectedSizeStock > 0;
  const maxQuantity = Math.max(selectedSizeStock, 1);
  const discount = useMemo(() => {
    if (!product || product.mrp <= product.price) return 0;
    return Math.round(((product.mrp - product.price) / product.mrp) * 100);
  }, [product]);

  /* ======================================================================= */
  /* SYNC SELECTIONS */
  /* ======================================================================= */

  useEffect(() => {
    if (
      sizeOptions.length &&
      (!selectedSize || !sizeOptions.includes(selectedSize))
    ) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  useEffect(() => {
    if (galleryImages.length && !selectedImage) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages, selectedImage]);

  /* ======================================================================= */
  /* HANDLERS */
  /* ======================================================================= */

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, maxQuantity));
  }, [maxQuantity]);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  const handleAddToCart = useCallback(() => {
    if (!isInStock) return;
    console.log("ADD TO CART", {
      productId: id,
      variant: selectedVariant,
      size: selectedSize,
      quantity,
    });
  }, [id, selectedVariant, selectedSize, quantity, isInStock]);

  const handleBuyNow = useCallback(() => {
    if (!isInStock) return;
    console.log("BUY NOW", {
      productId: id,
      variant: selectedVariant,
      size: selectedSize,
      quantity,
    });
  }, [id, selectedVariant, selectedSize, quantity, isInStock]);

  /* ======================================================================= */
  /* RENDER */
  /* ======================================================================= */

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      {!isLoading && product && (
        <div className="border-b border-border/40 bg-muted/20">
          <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li>
                <Link href={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
                  {product.category}
                </Link>
              </li>
              <ChevronRight className="h-3 w-3" />
              <li className="text-foreground font-medium truncate max-w-[180px]">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>
      )}

      {/* Loading */}
      {isLoading && <ProductSkeleton />}

      {/* Error */}
      {!isLoading && error && (
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
            <h2 className="text-lg font-semibold text-destructive">
              Could not load product
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Product Content */}
      {!isLoading && product && (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:gap-16">

            {/* ============================================================ */}
            {/* LEFT — GALLERY */}
            {/* ============================================================ */}
            <div className="lg:sticky lg:top-6 lg:self-start">
              <div className="space-y-4">
                {/* Main Image */}
                {selectedImage ? (
                  <button
                    onClick={() => setIsImageOpen(true)}
                    className="group relative block w-full overflow-hidden rounded-2xl bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    style={{ aspectRatio: "3 / 4" }}
                    aria-label="Click to zoom"
                  >
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority
                      quality={IMAGE_QUALITY}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Label badge */}
                    {product.label && (
                      <div className="absolute left-4 top-4">
                        <Badge className="bg-foreground/90 text-background text-[11px] px-2.5 py-1 font-medium backdrop-blur-sm">
                          <Sparkles className="mr-1 h-3 w-3" />
                          {product.label}
                        </Badge>
                      </div>
                    )}
                    {/* Discount tag */}
                    {discount > 0 && (
                      <div className="absolute right-4 top-4">
                        <span className="inline-flex items-center rounded-lg bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                          {discount}% OFF
                        </span>
                      </div>
                    )}
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg backdrop-blur-sm">
                        <ZoomIn size={16} />
                        Click to zoom
                      </div>
                    </div>
                  </button>
                ) : (
                  <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-muted">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={img}
                        onClick={() => setSelectedImage(img)}
                        className={cn(
                          "relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                          selectedImage === img
                            ? "border-primary shadow-md ring-1 ring-primary/30"
                            : "border-border/50 opacity-60 hover:opacity-100 hover:border-border"
                        )}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <Image
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          quality={THUMBNAIL_QUALITY}
                          sizes="72px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ============================================================ */}
            {/* RIGHT — PRODUCT DETAILS */}
            {/* ============================================================ */}
            <div className="flex flex-col">
              {/* Category breadcrumb */}
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                {product.category}
                {product.subCategory && (
                  <span className="text-border mx-2">·</span>
                )}
                {product.subCategory}
              </p>

              {/* Title */}
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl leading-tight font-serif">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={cn(
                        i < Math.round(product.averageRating || 0)
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/25 fill-muted-foreground/25"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-foreground">
                  {product.averageRating?.toFixed(1) || "0.0"}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({product.ratingCount || 0} reviews)
                </span>
              </div>

              {/* Pricing */}
              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-foreground">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-base text-muted-foreground line-through">
                      ₹{product.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      Save ₹{(product.mrp - product.price).toLocaleString("en-IN")}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Inclusive of all taxes
              </p>

              <Separator className="my-6" />

              {/* Color Selection */}
              {colorOptions.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Colour
                    </label>
                    <span className="text-xs text-muted-foreground capitalize">
                      {selectedVariant}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedVariant(color)}
                        className={cn(
                          "relative h-10 w-10 rounded-full border-2 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          selectedVariant === color
                            ? "border-primary ring-2 ring-primary/30 ring-offset-2"
                            : "border-border hover:border-primary/40"
                        )}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                        aria-label={`Select ${color}`}
                        aria-pressed={selectedVariant === color}
                      >
                        {selectedVariant === color && (
                          <Check className="absolute inset-0 m-auto h-4 w-4 text-white drop-shadow-md" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizeOptions.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <label className="text-sm font-medium text-foreground">
                      Size
                    </label>
                    <button className="text-xs text-primary hover:underline">
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {sizeOptions.map((size) => {
                      const sizeStock =
                        activeVariant?.size?.find((s) => s.size === size)
                          ?.stock ?? 0;
                      const outOfStock = sizeStock === 0;

                      return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          className={cn(
                            "relative min-w-[3rem] rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                            outOfStock
                              ? "cursor-not-allowed border-border/30 bg-muted/40 text-muted-foreground/40 line-through"
                              : selectedSize === size
                                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                                : "border-border bg-background text-foreground hover:border-primary/50"
                          )}
                          aria-pressed={selectedSize === size}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-foreground">
                  Quantity
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span
                    className="w-12 text-center text-sm font-semibold"
                    role="status"
                    aria-live="polite"
                  >
                    {quantity}
                  </span>
                  <button
                    onClick={incrementQuantity}
                    disabled={quantity >= maxQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  {isInStock && (
                    <span className="ml-3 text-xs text-muted-foreground">
                      {selectedSizeStock} available
                    </span>
                  )}
                </div>
              </div>

              {/* Stock Status */}
              <div className="mt-4">
                {isInStock ? (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                    <Check className="h-4 w-4" />
                    In Stock
                  </div>
                ) : (
                  <p className="text-sm font-medium text-destructive">
                    Currently Out of Stock
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  variant="outline"
                  size="lg"
                  className="flex-1 h-12 rounded-xl font-semibold text-sm"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button
                  onClick={handleBuyNow}
                  disabled={!isInStock}
                  size="lg"
                  className="flex-1 h-12 rounded-xl font-semibold text-sm"
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={cn(
                    "h-12 w-12 shrink-0 rounded-xl transition-colors",
                    isWishlisted && "border-rose-300 bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-950/30 dark:border-rose-800"
                  )}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={cn("h-5 w-5", isWishlisted && "fill-rose-500 text-rose-500")}
                  />
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6">
                <TrustBadges />
              </div>

              <Separator className="my-6" />

              {/* Product Information Accordion */}
              <div>
                <AccordionItem title="Description" defaultOpen>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description || "No description available for this product."}
                  </p>
                </AccordionItem>

                <AccordionItem title="Product Details">
                  <div className="space-y-2">
                    {[
                      { label: "SKU", value: product.sku },
                      { label: "Category", value: product.category },
                      { label: "Sub Category", value: product.subCategory },
                      { label: "Design", value: product.design },
                    ]
                      .filter((item) => item.value)
                      .map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-sm"
                        >
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    {product.productInformation && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground border-t border-border/40 pt-3">
                        {product.productInformation}
                      </p>
                    )}
                  </div>
                </AccordionItem>

                <AccordionItem title="Shipping & Returns">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <Truck className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Standard Delivery</p>
                        <p>Delivered within 5–7 business days. Free shipping on orders above ₹999.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <RotateCcw className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Easy Returns</p>
                        <p>Return within 7 days of delivery. Items must be unused with original tags.</p>
                      </div>
                    </div>
                  </div>
                </AccordionItem>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* REVIEWS SECTION */}
          {/* ============================================================ */}
          <div className="mt-16">
            <Separator />
            <div className="pt-10">
              <div className="mb-2 flex items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl font-serif">
                  Customer Reviews
                </h2>
                {(product.review?.length ?? 0) > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {product.review?.length} {product.review?.length === 1 ? "review" : "reviews"}
                  </Badge>
                )}
              </div>
              {product.review?.length === 0 && (
                <p className="text-sm text-muted-foreground mb-6">
                  No reviews yet. Be the first to share your experience!
                </p>
              )}
              <Review_04 
                productId={id} 
                reviews={product.review} 
                averageRating={product.averageRating || 0}
                ratingCount={product.ratingCount || 0}
              />
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      <ImageZoomViewer
        imageSrc={selectedImage || ""}
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
      />
    </div>
  );
}
