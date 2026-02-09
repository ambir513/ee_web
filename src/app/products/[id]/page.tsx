"use client";

import Image from "next/image";
import { use, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Review_04 from "@/components/commerce-ui/review-04";
import { Header } from "@/components/landing/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Product as ApiProduct } from "@/types/product";
import { Star, X, ZoomIn, ZoomOut, AlertCircle } from "lucide-react";

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

  // Setup wheel event listener with non-passive flag
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

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      {/* Main Image Container */}
      <div
        ref={containerRef}
        className="relative flex h-[90vh] w-[90vw] max-h-[90vh] max-w-[90vw] items-center justify-center overflow-hidden rounded-xl bg-black"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scaled Image */}
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

        {/* Left Zoom Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 rounded-lg bg-white/10 p-3 backdrop-blur-md">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoom("in");
            }}
            disabled={zoom >= ZOOM_MAX}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom in (Keyboard: +)"
            aria-label="Zoom in"
          >
            <ZoomIn size={20} />
          </button>

          <div
            className="w-10 text-center text-xs font-medium text-white"
            aria-live="polite"
            aria-atomic="true"
          >
            {zoomPercentage}%
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleZoom("out");
            }}
            disabled={zoom <= ZOOM_MIN}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Zoom out (Keyboard: -)"
            aria-label="Zoom out"
          >
            <ZoomOut size={20} />
          </button>

          {isMagnified && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="mt-2 rounded-lg bg-white/20 px-2 py-1 text-xs font-medium text-white transition-all hover:bg-white/30 active:scale-95"
              title="Reset zoom"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute right-6 top-6 flex items-center gap-3">
          <div className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {isMagnified ? "Drag to pan • Scroll to zoom" : "Scroll to zoom"}
          </div>
          <button
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 backdrop-blur-md"
            title="Close (ESC)"
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
/* MAIN PRODUCT PAGE COMPONENT */
/* ========================================================================== */

export default function ProductPage({ params }: ProductPageProps) {
  const { id } = use(params);
  const [product, setProduct] = useState<ProductWithReviews | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [infoTab, setInfoTab] = useState<
    "description" | "features" | "shipping"
  >("description");
  const [isImageOpen, setIsImageOpen] = useState(false);

  /* ========================================================================= */
  /* FETCH PRODUCT */
  /* ========================================================================= */

  useEffect(() => {
    let mounted = true;

    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      if (!isValidObjectId(id)) {
        setError("Invalid product ID format");
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get<{
          status: boolean;
          message?: string;
          data?: ProductWithReviews;
        }>(`/product/${encodeURIComponent(id)}`);

        if (!res.status || !res.data) {
          throw new Error(res.message || "Failed to fetch product");
        }

        if (!mounted) return;

        setProduct(res.data);
        setSelectedVariant(res.data.variants?.[0]?.color);
        setSelectedSize(res.data.variants?.[0]?.size?.[0]?.size || null);
      } catch (err: unknown) {
        if (mounted) {
          const message =
            err instanceof Error ? err.message : "Failed to load product";
          setError(message);
          console.error("Product fetch error:", err);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  /* ========================================================================= */
  /* MEMOIZED COMPUTATIONS */
  /* ========================================================================= */

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

  /* ========================================================================= */
  /* SYNC SIZE SELECTION */
  /* ========================================================================= */

  useEffect(() => {
    if (
      sizeOptions.length &&
      (!selectedSize || !sizeOptions.includes(selectedSize))
    ) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);

  /* ========================================================================= */
  /* SYNC GALLERY IMAGES */
  /* ========================================================================= */

  useEffect(() => {
    if (galleryImages.length && !selectedImage) {
      setSelectedImage(galleryImages[0]);
    }
  }, [galleryImages, selectedImage]);

  /* ========================================================================= */
  /* HANDLERS */
  /* ========================================================================= */

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
    // TODO: Implement actual cart functionality
  }, [id, selectedVariant, selectedSize, quantity, isInStock]);

  const handleBuyNow = useCallback(() => {
    if (!isInStock) return;
    console.log("BUY NOW", {
      productId: id,
      variant: selectedVariant,
      size: selectedSize,
      quantity,
    });
    // TODO: Implement actual checkout flow
  }, [id, selectedVariant, selectedSize, quantity, isInStock]);

  /* ========================================================================= */
  /* RENDER */
  /* ========================================================================= */

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mb-4 inline-flex h-12 w-12 animate-spin rounded-full border-4 border-border border-t-primary" />
            <p className="text-sm text-muted-foreground">Loading product...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
              <div>
                <h2 className="text-lg font-semibold text-destructive">
                  Could not load product
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Content */}
      {!isLoading && product && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Gallery Section */}
            <div className="space-y-4">
              {/* Main Image */}
              {selectedImage ? (
                <button
                  onClick={() => setIsImageOpen(true)}
                  className="group relative block w-full overflow-hidden rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{ aspectRatio: "1" }}
                  aria-label="Click to zoom product image"
                >
                  <Image
                    src={selectedImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    priority
                    quality={IMAGE_QUALITY}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Zoom Indicator Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="rounded-lg bg-white/90 px-4 py-2 flex items-center gap-2 font-medium text-sm">
                      <ZoomIn size={16} />
                      Click to zoom
                    </div>
                  </div>
                </button>
              ) : (
                <div className="flex h-96 w-full items-center justify-center rounded-2xl bg-muted">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}

              {/* Thumbnail Gallery */}
              {galleryImages.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((img) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        selectedImage === img
                          ? "border-primary shadow-md"
                          : "border-border opacity-60 hover:opacity-100",
                      )}
                      aria-label={`Select image ${galleryImages.indexOf(img) + 1}`}
                      aria-pressed={selectedImage === img}
                    >
                      <Image
                        src={img}
                        alt="Product thumbnail"
                        fill
                        className="object-cover"
                        quality={THUMBNAIL_QUALITY}
                        sizes="80px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details Section */}
            <div className="flex flex-col gap-8">
              {/* Header Info */}
              <div className="space-y-4">
                {/* Category */}
                <div className="text-sm font-medium text-muted-foreground">
                  {product.category}
                  {product.subCategory && ` • ${product.subCategory}`}
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    {product.name}
                  </h1>
                  {product.label && (
                    <Badge className="mt-3" variant="secondary">
                      {product.label}
                    </Badge>
                  )}
                </div>

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={cn(
                          "transition-colors",
                          i < Math.round((product.averageRating || 0) / 1)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted",
                        )}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-sm">
                    {product.averageRating?.toFixed(1) || "0.0"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ({product.ratingCount || 0} reviews)
                  </span>
                </div>

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <span className="text-3xl font-bold text-foreground">
                      ₹{product.price.toLocaleString("en-IN")}
                    </span>
                    {product.mrp > product.price && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          ₹{product.mrp.toLocaleString("en-IN")}
                        </span>
                        <Badge variant="destructive">{discount}% off</Badge>
                      </>
                    )}
                  </div>
                  {product.mrp > product.price && (
                    <p className="text-sm font-medium text-green-600">
                      You save ₹
                      {(product.mrp - product.price).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Info Tabs */}
                <div className="space-y-4">
                  <div className="flex rounded-lg border border-border bg-muted p-1">
                    {(["description", "features", "shipping"] as const).map(
                      (tab) => (
                        <button
                          key={tab}
                          onClick={() => setInfoTab(tab)}
                          className={cn(
                            "flex-1 px-4 py-2 rounded-md font-medium text-sm transition-colors capitalize focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            infoTab === tab
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground",
                          )}
                          aria-selected={infoTab === tab}
                          role="tab"
                        >
                          {tab}
                        </button>
                      ),
                    )}
                  </div>

                  <div
                    className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed text-foreground"
                    role="tabpanel"
                  >
                    {infoTab === "description" &&
                      (product.description || "No description available.")}
                    {infoTab === "features" &&
                      (product.productInformation ||
                        "No additional information available.")}
                    {infoTab === "shipping" &&
                      "Standard delivery within 5–7 business days. Free shipping on eligible orders."}
                  </div>
                </div>
              </div>

              {/* Selection & Purchase */}
              <div className="space-y-6 border-t pt-6">
                {/* Color Selection */}
                {colorOptions.length > 0 && (
                  <div className="space-y-3">
                    <label className="block font-semibold text-foreground">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedVariant(color)}
                          className={cn(
                            "h-12 w-12 rounded-full border-2 transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            selectedVariant === color
                              ? "border-primary ring-2 ring-primary/40 ring-offset-2"
                              : "border-border hover:border-primary/50",
                          )}
                          style={{
                            backgroundColor: color.toLowerCase(),
                          }}
                          title={`Select ${color}`}
                          aria-label={`Select ${color}`}
                          aria-pressed={selectedVariant === color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selection */}
                {sizeOptions.length > 0 && (
                  <div className="space-y-3">
                    <label className="block font-semibold text-foreground">
                      Size
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizeOptions.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={cn(
                            "rounded-lg border-2 px-6 py-3 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                            selectedSize === size
                              ? "border-primary bg-primary text-primary-foreground shadow-md"
                              : "border-border bg-background text-foreground hover:border-primary/50",
                          )}
                          aria-pressed={selectedSize === size}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Selection */}
                <div className="space-y-3">
                  <label
                    htmlFor="quantity"
                    className="block font-semibold text-foreground"
                  >
                    Quantity
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={decrementQuantity}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span
                      id="quantity"
                      className="w-8 text-center font-semibold"
                      role="status"
                      aria-live="polite"
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= maxQuantity}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Stock Status */}
                <div className="space-y-2">
                  {isInStock ? (
                    <>
                      <p className="text-sm font-medium text-green-600">
                        ✓ In stock
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedSizeStock} piece
                        {selectedSizeStock !== 1 ? "s" : ""} available
                      </p>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-destructive">
                      Out of stock
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!isInStock}
                    variant="outline"
                    size="lg"
                    className="flex-1 font-semibold"
                  >
                    Add to Cart
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    disabled={!isInStock}
                    size="lg"
                    className="flex-1 font-semibold"
                  >
                    Buy Now
                  </Button>
                </div>

                {/* Product Meta */}
                <div className="space-y-2 text-sm text-muted-foreground border-t pt-4">
                  <p>
                    <span className="font-medium text-foreground">SKU:</span>{" "}
                    <code className="text-xs">{product.sku}</code>
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Design:</span>{" "}
                    {product.design}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-12 border-t pt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Customer Reviews
            </h2>
            <div className="mb-6 text-sm text-muted-foreground">
              {product.review?.length
                ? `${product.review.length} review${product.review.length !== 1 ? "s" : ""}`
                : "No reviews yet"}
            </div>
            <Review_04 />
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
