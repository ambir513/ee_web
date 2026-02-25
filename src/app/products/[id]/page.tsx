"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState, useRef, useCallback } from "react";
import Review_04 from "@/components/commerce-ui/review-04";
import { Header } from "@/components/landing/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toastManager } from "@/components/ui/toast";
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
        className="relative flex h-[95vh] w-[95vw] sm:h-[90vh] sm:w-[90vw] max-h-[95vh] sm:max-h-[90vh] max-w-[95vw] sm:max-w-[90vw] items-center justify-center overflow-hidden rounded-lg sm:rounded-xl bg-black"
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
        <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 flex flex-col gap-1.5 sm:gap-2 rounded-xl bg-white/10 p-2 sm:p-3 backdrop-blur-md">
          <button
            onClick={(e) => { e.stopPropagation(); handleZoom("in"); }}
            disabled={zoom >= ZOOM_MAX}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom in"
          >
            <ZoomIn size={16} className="sm:hidden" />
            <ZoomIn size={18} className="hidden sm:block" />
          </button>
          <div className="w-9 sm:w-10 text-center text-[10px] sm:text-xs font-medium text-white">{zoomPercentage}%</div>
          <button
            onClick={(e) => { e.stopPropagation(); handleZoom("out"); }}
            disabled={zoom <= ZOOM_MIN}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Zoom out"
          >
            <ZoomOut size={16} className="sm:hidden" />
            <ZoomOut size={18} className="hidden sm:block" />
          </button>
          {isMagnified && (
            <button
              onClick={(e) => { e.stopPropagation(); handleReset(); }}
              className="mt-1 rounded-lg bg-white/20 px-2 py-1 text-[10px] sm:text-xs font-medium text-white transition-all hover:bg-white/30"
              aria-label="Reset zoom"
            >
              Reset
            </button>
          )}
        </div>

        {/* Top Controls */}
        <div className="absolute right-3 top-3 sm:right-6 sm:top-6 flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md">
            {isMagnified ? "Drag to pan · Scroll to zoom" : "Scroll to zoom"}
          </div>
          <button
            onClick={handleClose}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 text-white transition-all hover:bg-white/30 active:scale-95 backdrop-blur-md"
            aria-label="Close image viewer"
          >
            <X size={18} className="sm:hidden" />
            <X size={20} className="hidden sm:block" />
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
        className="flex w-full items-center justify-between py-5 text-xs font-semibold uppercase tracking-widest text-foreground hover:text-foreground/70 transition-colors"
      >
        {title}
        <Plus
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-300",
            isOpen && "rotate-45"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
      >
        <div className="overflow-hidden">
          <div className="pb-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* TRUST BADGES */
/* ========================================================================== */

function TrustBadges() {
  const badges = [
    { icon: Truck, label: "Free Shipping", desc: "On all orders" },
    { icon: RotateCcw, label: "Exchange Only", desc: "No refund policy" },
    { icon: ShieldCheck, label: "Authentic", desc: "100% genuine product" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {badges.map((badge) => (
        <div
          key={badge.label}
          className="flex flex-col items-center gap-1 sm:gap-1.5 rounded-none p-2 sm:p-3 text-center"
        >
          <badge.icon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
          <span className="text-[10px] sm:text-[11px] font-semibold text-foreground uppercase tracking-widest">
            {badge.label}
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <div className="grid gap-12 lg:grid-cols-2 xl:gap-24">
        {/* Gallery skeleton */}
        <div className="flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[80px] w-[60px] md:h-[100px] md:w-[75px] shrink-0 bg-muted animate-pulse" />
            ))}
          </div>
          <div className="flex-1 aspect-[3/4] bg-muted animate-pulse" />
        </div>
        {/* Details skeleton */}
        <div className="space-y-6 pt-4 sm:pt-0">
          <div className="space-y-4">
            <div className="h-3 w-24 bg-muted animate-pulse" />
            <div className="h-10 w-3/4 bg-muted animate-pulse" />
          </div>
          <div className="h-8 w-32 bg-muted animate-pulse mt-6" />
          <div className="space-y-4 mt-8">
            <div className="h-4 w-16 bg-muted animate-pulse" />
            <div className="flex gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 w-10 bg-muted animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-4 mt-8">
            <div className="h-4 w-16 bg-muted animate-pulse" />
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse" />
              ))}
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <div className="h-14 flex-1 bg-muted animate-pulse" />
            <div className="h-14 flex-1 bg-muted animate-pulse" />
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
  const queryClient = useQueryClient();
  const router = useRouter();

  // Check if user is logged in
  const { data: userData } = useQuery({
    queryKey: ["getUser"],
    queryFn: () => api.get("/account/me", { queryClient }),
    staleTime: 5 * 60 * 1000,
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
  const isLoggedIn = userData?.status === true;

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
    // Only show images from the currently selected color variant
    const variant = product.variants?.find((v) => v.color === selectedVariant) || product.variants?.[0];
    if (!variant) return [] as string[];
    return (variant.images ?? []).filter(Boolean);
  }, [product, selectedVariant]);

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

  const hasStock = selectedSizeStock > 0;
  const isInStock = hasStock && !!product?.isActive;
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

  // When gallery images change (color switch), always select the first image
  useEffect(() => {
    if (galleryImages.length) {
      setSelectedImage(galleryImages[0]);
    } else {
      setSelectedImage(null);
    }
  }, [galleryImages]);

  /* ======================================================================= */
  /* HANDLERS */
  /* ======================================================================= */

  const incrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.min(prev + 1, maxQuantity));
  }, [maxQuantity]);

  const decrementQuantity = useCallback(() => {
    setQuantity((prev) => Math.max(1, prev - 1));
  }, []);

  /* ======================================================================= */
  /* WATCHLIST QUERY & MUTATIONS */
  /* ======================================================================= */

  const { data: watchlistData } = useQuery({
    queryKey: ["watchlist", id],
    queryFn: () => api.get<{ status: boolean; data?: any }>(`/watchlist/${id}`, { queryClient }),
    enabled: isValidObjectId(id),
    retry: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  const isWishlisted = watchlistData?.status === true;

  const addToWishlistMutation = useMutation({
    mutationFn: () => api.get(`/watchlist/${id}`, { queryClient }),
    onSuccess: (res: any) => {
      if (res?.status) {
        // Optimistic: set cache directly, don't refetch (GET endpoint also adds)
        queryClient.setQueryData(["watchlist", id], { status: true, data: res.data });
        toastManager.add({
          title: "Added to Wishlist",
          description: `${product?.name} has been added to your wishlist.`,
          type: "success",
        });
      } else {
        toastManager.add({
          title: "Already in Wishlist",
          description: res?.message || "This product is already in your wishlist.",
          type: "info",
        });
      }
    },
    onError: () => {
      toastManager.add({
        title: "Please Login",
        description: "You need to be logged in to add items to your wishlist.",
        type: "error",
      });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: () => api.delete(`/watchlist/${id}`, { queryClient }),
    onSuccess: () => {
      // Optimistic: set cache to false immediately, don't refetch
      queryClient.setQueryData(["watchlist", id], { status: false, data: null });
      toastManager.add({
        title: "Removed from Wishlist",
        description: `${product?.name} has been removed from your wishlist.`,
        type: "success",
      });
    },
    onError: () => {
      toastManager.add({
        title: "Error",
        description: "Unable to remove from wishlist. Please try again.",
        type: "error",
      });
    },
  });

  const handleToggleWishlist = useCallback(() => {
    if (!isLoggedIn) { router.push("/login"); return; }
    if (addToWishlistMutation.isPending || removeFromWishlistMutation.isPending) return;
    if (isWishlisted) {
      removeFromWishlistMutation.mutate();
    } else {
      addToWishlistMutation.mutate();
    }
  }, [isLoggedIn, isWishlisted, addToWishlistMutation, removeFromWishlistMutation, router]);

  /* ======================================================================= */
  /* ADD TO CART MUTATION */
  /* ======================================================================= */

  const addToCartMutation = useMutation({
    mutationFn: () =>
      api.post(
        `/addtocart/create/${id}`,
        { color: selectedVariant, size: selectedSize },
        { queryClient },
      ),
    onSuccess: (res: any) => {
      if (res?.status) {
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
        toastManager.add({
          title: "Added to Cart",
          description: `${product?.name} (${selectedVariant}, ${selectedSize}) added to your cart.`,
          type: "success",
        });
      } else {
        toastManager.add({
          title: "Already in Cart",
          description: res?.message || "This variant is already in your cart.",
          type: "info",
        });
      }
    },
    onError: () => {
      toastManager.add({
        title: "Please Login",
        description: "You need to be logged in to add items to your cart.",
        type: "error",
      });
    },
  });

  const handleAddToCart = useCallback(() => {
    if (!isLoggedIn) { router.push("/signup"); return; }
    if (!isInStock || addToCartMutation.isPending) return;
    if (!selectedSize) {
      toastManager.add({
        title: "Select a Size",
        description: "Please select a size before adding to cart.",
        type: "warning",
      });
      return;
    }
    addToCartMutation.mutate();
  }, [isLoggedIn, isInStock, addToCartMutation, selectedSize, router]);

  const buyNowMutation = useMutation({
    mutationFn: () =>
      api.post(
        `/addtocart/create/${id}`,
        { color: selectedVariant, size: selectedSize },
        { queryClient },
      ),
    onSuccess: (res: any) => {
      if (res?.status) {
        queryClient.invalidateQueries({ queryKey: ["getCart"] });
        router.push("/account#cart");
      } else {
        // Already in cart — still redirect
        router.push("/account#cart");
      }
    },
    onError: () => {
      toastManager.add({
        title: "Please Login",
        description: "You need to be logged in to buy items.",
        type: "error",
      });
    },
  });

  const handleBuyNow = useCallback(() => {
    if (!isLoggedIn) { router.push("/signup"); return; }
    if (!isInStock || buyNowMutation.isPending) return;
    if (!selectedSize) {
      toastManager.add({
        title: "Select a Size",
        description: "Please select a size before buying.",
        type: "warning",
      });
      return;
    }
    buyNowMutation.mutate();
  }, [isLoggedIn, isInStock, buyNowMutation, selectedSize, router]);

  /* ======================================================================= */
  /* RENDER */
  /* ======================================================================= */

  return (
    <div className="min-h-screen my-2 bg-background pb-12 sm:pb-24">
      <Header />

      {/* Breadcrumb */}
      {!isLoading && product && (
        <div className="pt-4 pb-2">
          <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              </li>
              <li><span className="text-muted-foreground/40">/</span></li>
              <li>
                <Link href="/products" className="hover:text-foreground transition-colors">Shop</Link>
              </li>
              <li><span className="text-muted-foreground/40">/</span></li>
              <li className="hidden sm:inline-flex items-center gap-2">
                <Link href={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
                  {product.category}
                </Link>
                <span className="text-muted-foreground/40">/</span>
              </li>
              <li className="text-foreground truncate max-w-[140px] sm:max-w-[220px]">
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
          <div className="mx-auto max-w-md border border-destructive/20 bg-destructive/5 p-8 text-center bg-background">
            <AlertCircle className="mx-auto h-10 w-10 text-destructive mb-4" />
            <h2 className="text-lg font-medium text-destructive">
              Could not load product
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              className="mt-6 rounded-none uppercase tracking-wider text-xs font-semibold"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Product Content */}
      {!isLoading && product && (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">

            {/* ============================================================ */}
            {/* LEFT — GALLERY */}
            {/* ============================================================ */}
            <div className="lg:sticky lg:top-12 lg:self-start flex flex-col-reverse md:flex-row gap-3 sm:gap-5">

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[700px] scrollbar-none snap-x snap-mandatory pb-2 md:pb-0">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "relative h-[80px] w-[60px] md:h-[100px] md:w-[75px] shrink-0 overflow-hidden transition-all duration-300 snap-start focus:outline-none",
                        selectedImage === img
                          ? "opacity-100 ring-1 ring-foreground ring-offset-1 md:ring-offset-2"
                          : "opacity-50 hover:opacity-100"
                      )}
                      aria-label={`View image ${idx + 1}`}
                    >
                      <Image
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        quality={THUMBNAIL_QUALITY}
                        sizes="75px"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Image */}
              <div className="relative flex-1 block w-full bg-[#f9f9f9] dark:bg-muted/10 group overflow-hidden">
                <button
                  onClick={() => setIsImageOpen(true)}
                  className="relative block w-full aspect-[3/4] focus:outline-none"
                  aria-label="Click to zoom"
                >
                  {selectedImage ? (
                    <Image
                      src={selectedImage}
                      alt={product.name}
                      fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                      priority
                      quality={IMAGE_QUALITY}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <Package className="h-12 w-12 text-muted-foreground/30" />
                    </div>
                  )}
                </button>
                {/* Overlay Tags */}
                {product.label && (
                  <div className="absolute left-4 top-4">
                    <span className="bg-foreground text-background text-[9px] sm:text-[10px] uppercase tracking-widest px-3 py-1 font-semibold">
                      {product.label}
                    </span>
                  </div>
                )}
                {discount > 0 && (
                  <div className="absolute right-4 top-4">
                    <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] uppercase tracking-widest px-3 py-1 font-bold shadow-sm">
                      {discount}% OFF
                    </span>
                  </div>
                )}
                <div className="absolute bottom-4 right-4 hidden md:flex opacity-0 transition-opacity duration-300 group-hover:opacity-100 items-center justify-center bg-white/90 dark:bg-black/90 text-foreground p-2 rounded-full shadow-md backdrop-blur-sm pointer-events-none">
                  <ZoomIn size={18} />
                </div>
              </div>

            </div>

            {/* ============================================================ */}
            {/* RIGHT — PRODUCT DETAILS */}
            {/* ============================================================ */}
            <div className="flex flex-col pt-2 sm:pt-0">

              {/* Category */}
              <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3 sm:mb-4">
                {product.category}
                {product.subCategory && (
                  <span className="mx-2 text-muted-foreground/50">/</span>
                )}
                {product.subCategory}
              </p>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-foreground font-serif leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mt-5 sm:mt-6 flex items-end gap-3">
                <span className="text-xl sm:text-2xl lg:text-3xl font-medium text-foreground tracking-tight">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm sm:text-base text-muted-foreground/70 line-through mb-[2px] sm:mb-1">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Taxes included. Free shipping on all orders.
              </p>

              <Separator className="my-6 sm:my-8 opacity-50" />

              {/* Color Selection */}
              {colorOptions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-foreground">
                      Colour: <span className="text-muted-foreground ml-1">{selectedVariant}</span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 sm:gap-3">
                    {product.variants?.map((variant) => {
                      const thumbImg = variant.images?.[0];
                      const isSelected = selectedVariant === variant.color;
                      return (
                        <button
                          key={variant.color}
                          onClick={() => setSelectedVariant(variant.color)}
                          className={cn(
                            "relative h-14 w-10 sm:h-16 sm:w-12 overflow-hidden focus:outline-none transition-all duration-200",
                            isSelected
                              ? "ring-1 ring-foreground ring-offset-2 opacity-100"
                              : "opacity-60 hover:opacity-100"
                          )}
                          title={variant.color}
                          aria-label={`Select ${variant.color}`}
                          aria-pressed={isSelected}
                        >
                          {thumbImg ? (
                            <Image
                              src={thumbImg}
                              alt={variant.color}
                              fill
                              className="object-cover"
                              quality={60}
                              sizes="48px"
                            />
                          ) : (
                            <div className="h-full w-full bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizeOptions.length > 0 && (
                <div className="mt-6 sm:mt-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.15em] text-foreground">
                      Size
                    </span>
                    <button className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-0.5">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
                    {sizeOptions.map((size) => {
                      const sizeStock =
                        activeVariant?.size?.find((s) => s.size === size)?.stock ?? 0;
                      const outOfStock = sizeStock === 0;

                      return (
                        <button
                          key={size}
                          onClick={() => !outOfStock && setSelectedSize(size)}
                          disabled={outOfStock}
                          className={cn(
                            "flex items-center justify-center py-2.5 sm:py-3 text-xs sm:text-sm transition-all focus:outline-none",
                            outOfStock
                              ? "cursor-not-allowed border border-border/40 bg-muted/20 text-muted-foreground/40 line-through"
                              : selectedSize === size
                                ? "bg-foreground text-background font-medium shadow-sm"
                                : "border border-border/80 hover:border-foreground text-foreground bg-background"
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

              {/* Quantity & Stock Status */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:items-end gap-5">
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-medium uppercase tracking-[0.15em] text-foreground">
                    Quantity
                  </span>
                  <div className="flex items-center border border-border/80 h-10 w-28 sm:h-12 sm:w-32 bg-background">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="flex-1 flex items-center justify-center h-full text-foreground/60 hover:text-foreground disabled:opacity-30 transition-colors focus:outline-none active:bg-muted/50"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <span className="flex-1 text-center text-sm font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= maxQuantity}
                      className="flex-1 flex items-center justify-center h-full text-foreground/60 hover:text-foreground disabled:opacity-30 transition-colors focus:outline-none active:bg-muted/50"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 pb-2 sm:pb-3">
                  {isInStock ? (
                    <div className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-emerald-600">
                      <Check className="h-3.5 w-3.5" />
                      In Stock
                    </div>
                  ) : !product?.isActive && hasStock ? (
                    <p className="text-xs font-medium tracking-wide text-amber-600">
                      Currently Unavailable
                    </p>
                  ) : (
                    <p className="text-xs font-medium tracking-wide text-destructive">
                      Out of Stock
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons — Main UI */}
              <div className="mt-8 flex flex-col gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock || addToCartMutation.isPending}
                  className="w-full h-12 sm:h-14 rounded-none text-[11px] sm:text-xs uppercase tracking-[0.15em] font-semibold bg-foreground hover:bg-foreground/90 transition-all text-background"
                >
                  {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={handleBuyNow}
                    disabled={!isInStock || buyNowMutation.isPending}
                    variant="outline"
                    className="flex-1 h-12 sm:h-14 rounded-none text-[11px] sm:text-xs uppercase tracking-[0.15em] font-semibold border-border hover:border-foreground hover:bg-transparent transition-all bg-background text-foreground"
                  >
                    {buyNowMutation.isPending ? "Redirecting..." : "Buy Now"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleToggleWishlist}
                    disabled={addToWishlistMutation.isPending || removeFromWishlistMutation.isPending}
                    className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-none border-border hover:border-foreground hover:bg-transparent transition-all p-0 flex items-center justify-center bg-background"
                    aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4 sm:h-5 sm:w-5 transition-colors",
                        isWishlisted && "fill-rose-500 text-rose-500"
                      )}
                    />
                  </Button>
                </div>
              </div>

              {/* Trust Information */}
              <div className="mt-6 flex items-center gap-6 text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> 100% Authentic</span>
                <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Fast Shipping</span>
              </div>

              <div className="mt-10 sm:mt-12 space-y-0 border-t border-border/60">
                <AccordionItem title="Description" defaultOpen>
                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground font-light">
                    <p>{product.description || "No description available for this product."}</p>
                    {product.productInformation && <p>{product.productInformation}</p>}
                  </div>
                </AccordionItem>

                <AccordionItem title="Details">
                  <div className="space-y-3 text-xs sm:text-sm text-foreground font-light">
                    {[
                      { label: "SKU", value: product.sku },
                      { label: "Category", value: product.category },
                      { label: "Sub Category", value: product.subCategory },
                      { label: "Design", value: product.design },
                    ]
                      .filter((item) => item.value)
                      .map((item) => (
                        <div key={item.label} className="grid grid-cols-3">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="col-span-2">{item.value}</span>
                        </div>
                      ))}
                  </div>
                </AccordionItem>

                <AccordionItem title="Shipping & Returns">
                  <div className="space-y-4 text-xs sm:text-sm text-muted-foreground font-light pt-1">
                    <p>Free standard shipping on all orders. Delivered within 5–7 business days.</p>
                    <p>We do not offer refunds. Exchange is available within 7 days of delivery. Items must be unused and in original condition with tags attached.</p>
                  </div>
                </AccordionItem>
              </div>

            </div>
          </div>

          {/* ============================================================ */}
          {/* REVIEWS SECTION */}
          {/* ============================================================ */}
          <div className="mt-20 sm:mt-32 max-w-4xl mx-auto">
            <div className="mb-10 sm:mb-16 text-center">
              <h2 className="text-2xl sm:text-3xl font-serif text-foreground tracking-tight mb-3">
                Customer Reviews
              </h2>
              {product.averageRating !== undefined && product.averageRating > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={cn(
                          i < Math.round(product.averageRating || 0)
                            ? "fill-foreground text-foreground"
                            : "text-muted-foreground/30 fill-transparent"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground ml-1">
                    {product.averageRating.toFixed(1)} based on {product.ratingCount || product.review?.length || 0} reviews
                  </span>
                </div>
              )}
            </div>

            <Review_04
              productId={id}
              reviews={product.review}
              averageRating={product.averageRating || 0}
              ratingCount={product.ratingCount || 0}
            />
          </div>
        </div>
      )}

      {/* Sticky Mobile Bottom CTA Bar */}
      {!isLoading && product && (
        <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-border/80 bg-background pb-safe px-4 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAddToCart}
              disabled={!isInStock || addToCartMutation.isPending}
              className="flex-1 h-12 rounded-none text-[11px] uppercase tracking-wider font-semibold bg-foreground text-background"
            >
              {addToCartMutation.isPending ? "Adding..." : "Add to Cart"}
            </Button>
            <Button
              onClick={handleBuyNow}
              disabled={!isInStock || buyNowMutation.isPending}
              variant="outline"
              className="flex-1 h-12 rounded-none text-[11px] uppercase tracking-wider font-semibold border-border bg-background text-foreground"
            >
              {buyNowMutation.isPending ? "Redirecting..." : "Buy Now"}
            </Button>
          </div>
        </div>
      )}

      {/* Spacer for sticky bar on mobile */}
      {!isLoading && product && (
        <div className="h-20 sm:hidden" />
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
