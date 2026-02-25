"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  Ticket,
  X,
  Check,
  Loader2,
  MapPin,
  ChevronLeft,
  ShieldCheck,
  Lock,
  Sparkles,
  BadgePercent,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toastManager } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

/* ===================================================================== */
/* TYPES                                                                 */
/* ===================================================================== */

interface CartProduct {
  _id: string;
  name: string;
  price: number;
  mrp: number;
  category?: string;
  subCategory?: string;
  sku?: string;
  design?: string;
  variants?: {
    color: string;
    images: string[];
    size?: { size: string; stock: number }[];
  }[];
}

interface CartItem {
  _id: string;
  productId: CartProduct;
  color: string;
  size: string;
  quantity: number;
  totalPrice: number;
}

interface AddressData {
  _id: string;
  label: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  city: string;
  state: string;
  country: string;
  pinCode: string | number;
  phoneNo: string | number;
}

/* ===================================================================== */
/* COUPON TYPES                                                          */
/* ===================================================================== */

interface CouponApiResponse {
  code: string;
  offer: string;
  discountProducts: any[];
  amount: number;
}

/* ===================================================================== */
/* HELPERS                                                               */
/* ===================================================================== */

function getVariantImage(product: CartProduct, color?: string): string | null {
  if (!product.variants?.length) return null;
  if (color) {
    const variant = product.variants.find((v) => v.color === color);
    if (variant?.images?.length) return variant.images[0];
  }
  for (const variant of product.variants) {
    if (variant.images?.length) return variant.images[0];
  }
  return null;
}

function getItemStock(
  product: CartProduct,
  color: string,
  size: string,
): number {
  if (!product.variants?.length) return 0;
  const variant = product.variants.find((v) => v.color === color);
  if (!variant?.size?.length) return 0;
  const sizeEntry = variant.size.find((s) => s.size === size);
  return sizeEntry?.stock ?? 0;
}

/** Load Razorpay SDK dynamically */
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/* ===================================================================== */
/* MAIN COMPONENT                                                        */
/* ===================================================================== */

type CheckoutStep = "cart" | "address" | "payment";

export function CartTab() {
  const queryClient = useQueryClient();
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponData, setCouponData] = useState<CouponApiResponse | null>(null);
  const [couponSuccess, setCouponSuccess] = useState(false);

  // Checkout flow state
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("cart");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  /* ================================================================== */
  /* QUERIES                                                            */
  /* ================================================================== */

  const {
    data: cartData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getCart"],
    queryFn: async () => {
      const response = await api.get("/addtocart/all", { queryClient });
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: addressData } = useQuery({
    queryKey: ["getAddress"],
    queryFn: async () => {
      const response = await api.get("/account/address", { queryClient });
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const { data: userData } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me", { queryClient });
      return response;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  /* ================================================================== */
  /* MUTATIONS                                                          */
  /* ================================================================== */

  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      itemId,
      quantity,
    }: {
      itemId: string;
      quantity: number;
    }) => {
      return api.post(
        `/addtocart/update/${itemId}`,
        { quantity },
        { queryClient },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart"] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      return api.delete(`/addtocart/delete/${itemId}`, { queryClient });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart"] });
    },
  });

  /* ================================================================== */
  /* DERIVED DATA                                                       */
  /* ================================================================== */

  const items: CartItem[] = cartData?.data || [];
  const addresses: AddressData[] = (addressData?.data || []).map(
    (a: any) => a,
  );
  const user = userData?.data;

  const updateQuantity = (itemId: string, delta: number) => {
    const item = items.find((i) => i._id === itemId);
    if (item) {
      const stock = getItemStock(item.productId, item.color, item.size);
      const maxQty = stock > 0 ? stock : item.quantity;
      const newQuantity = Math.min(Math.max(1, item.quantity + delta), maxQty);
      if (newQuantity !== item.quantity) {
        updateQuantityMutation.mutate({ itemId, quantity: newQuantity });
      }
    }
  };

  const removeItem = (itemId: string) => {
    deleteItemMutation.mutate(itemId);
  };

  /* ================================================================== */
  /* COUPON MUTATION                                                     */
  /* ================================================================== */

  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      // Expand each cart item by its quantity so the API's quantityMap
      // correctly counts how many units of each product are in the cart
      const productIds = items.flatMap((item) =>
        Array.from({ length: item.quantity }, () => ({
          _id: item.productId._id,
        })),
      );
      const orderValue = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const response: any = await api.post(
        "/coupon/code/apply",
        { code, orderValue, productIds },
        { queryClient },
      );
      return response;
    },
    onSuccess: (response: any) => {
      if (response?.status && response?.data) {
        setAppliedCoupon(response.data.code);
        setCouponData(response.data);
        setCouponError("");
        setCouponInput("");
        setShowCouponInput(false);
        setCouponSuccess(true);
        setTimeout(() => setCouponSuccess(false), 2000);
        toastManager.add({
          title: "Coupon Applied! 🎉",
          timeout: 2000,
          description: response.data.offer || "Discount applied to your order.",
          type: "success",
        });
      } else {
        setCouponError(response?.message || "Invalid coupon code");
        setAppliedCoupon(null);
        setCouponData(null);
      }
    },
    onError: (error: any) => {
      setCouponError(error?.message || "Failed to apply coupon. Try again.");
      setAppliedCoupon(null);
      setCouponData(null);
    },
  });

  const applyCoupon = (couponCode: string) => {
    const trimmedCode = couponCode.trim().toUpperCase();
    if (!trimmedCode) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setCouponError("");
    applyCouponMutation.mutate(trimmedCode);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponData(null);
    setCouponError("");
    setCouponInput("");
    setShowCouponInput(false);
    setCouponSuccess(false);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const mrpTotal = items.reduce((sum, item) => {
    const mrp = item.productId.mrp || item.productId.price;
    return sum + mrp * item.quantity;
  }, 0);
  const productSavings = mrpTotal - subtotal;

  // Calculate discount from API response (rounded to avoid decimal issues)
  const discountAmount = couponData
    ? Math.round(Math.max(0, subtotal - couponData.amount))
    : 0;

  const totalAmount = couponData
    ? Math.round(Math.max(0, couponData.amount))
    : subtotal;

  /* ================================================================== */
  /* RAZORPAY CHECKOUT                                                  */
  /* ================================================================== */

  const handleProceedToCheckout = () => {
    if (items.length === 0) return;
    if (addresses.length === 0) {
      toastManager.add({
        title: "No Address Found",
        description:
          "Please add a shipping address in the Address tab before checkout.",
        type: "warning",
      });
      return;
    }
    // Auto-select first address if none selected
    if (!selectedAddressId && addresses.length > 0) {
      setSelectedAddressId(addresses[0]._id);
    }
    setCheckoutStep("address");
  };

  const handlePayNow = async () => {
    if (!selectedAddressId) {
      toastManager.add({
        title: "Select Address",
        description: "Please select a delivery address.",
        type: "warning",
      });
      return;
    }

    setIsProcessingPayment(true);

    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toastManager.add({
          title: "Payment Error",
          description:
            "Failed to load payment gateway. Please check your internet connection.",
          type: "error",
        });
        setIsProcessingPayment(false);
        return;
      }

      // 2. Create order on backend
      const orderResponse: any = await api.post(
        "/payment/create",
        {
          amount: totalAmount,
          offer: appliedCoupon || "",
          name: user?.name || "",
          email: user?.email || "",
          addressId: selectedAddressId,
        },
        { queryClient },
      );

      if (!orderResponse?.status || !orderResponse?.data?.razorpayOrder) {
        toastManager.add({
          title: "Order Error",
          description:
            orderResponse?.message || "Failed to create order. Please try again.",
          type: "error",
        });
        setIsProcessingPayment(false);
        return;
      }

      const { razorpayOrder } = orderResponse.data;

      // 3. Open Razorpay checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_X7oXoYI3bvY2r1",
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Ethnic Edge",
        description: `Order for ${totalItems} item(s)`,
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          // 4. Verify payment on backend
          try {
            const verifyResponse: any = await api.post(
              "/payment/verify",
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { queryClient },
            );

            if (verifyResponse?.status) {
              // Clear cart cache and reset state
              queryClient.invalidateQueries({ queryKey: ["getCart"] });
              queryClient.invalidateQueries({ queryKey: ["getOrders"] });
              setCheckoutStep("cart");
              setSelectedAddressId(null);

              toastManager.add({
                title: "Payment Successful! 🎉",
                description:
                  "Your order has been placed successfully. You can track it in the Orders tab.",
                type: "success",
              });
            } else {
              toastManager.add({
                title: "Verification Failed",
                description:
                  verifyResponse?.message ||
                  "Payment verification failed. Contact support if amount was deducted.",
                type: "error",
              });
            }
          } catch {
            toastManager.add({
              title: "Verification Error",
              description:
                "Could not verify payment. Please check your orders or contact support.",
              type: "error",
            });
          }
          setIsProcessingPayment(false);
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: "",
        },
        theme: {
          color: "#18181b",
        },
        modal: {
          ondismiss: () => {
            setIsProcessingPayment(false);
            toastManager.add({
              title: "Payment Cancelled",
              description: "You cancelled the payment. Your cart is still saved.",
              type: "info",
            });
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        setIsProcessingPayment(false);
        toastManager.add({
          title: "Payment Failed",
          description:
            response.error?.description ||
            "Payment could not be processed. Please try again.",
          type: "error",
        });
      });
      razorpay.open();
    } catch (err) {
      setIsProcessingPayment(false);
      toastManager.add({
        title: "Error",
        description: "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  /* ================================================================== */
  /* RENDER: LOADING / EMPTY                                            */
  /* ================================================================== */

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (isError || items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground">
            Your cart is empty
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse products and add items to your cart.
          </p>
        </div>
      </div>
    );
  }

  /* ================================================================== */
  /* RENDER: ADDRESS SELECTION STEP                                     */
  /* ================================================================== */

  if (checkoutStep === "address") {
    const selectedAddr = addresses.find((a) => a._id === selectedAddressId);

    return (
      <div className="flex flex-col gap-6">
        {/* Back button */}
        <button
          onClick={() => setCheckoutStep("cart")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Cart
        </button>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Address List */}
          <div className="flex-1">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                Select Delivery Address
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Choose where you&apos;d like your order delivered.
              </p>
              <Separator className="mb-4" />

              {addresses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <MapPin className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-medium text-foreground">
                    No addresses saved
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add a shipping address in the Address tab first.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <button
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={cn(
                          "w-full text-left rounded-lg border-2 p-4 transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/30",
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                              isSelected
                                ? "border-primary bg-primary"
                                : "border-muted-foreground/40",
                            )}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-primary-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {addr.label}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                              {addr.addressLine1}
                              {addr.addressLine2
                                ? `, ${addr.addressLine2}`
                                : ""}
                              {addr.addressLine3
                                ? `, ${addr.addressLine3}`
                                : ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {addr.city}, {addr.state} - {addr.pinCode}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Phone: {addr.phoneNo}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="w-full lg:w-96">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-foreground">
                Payment Summary
              </h2>
              <Separator className="my-4" />

              {/* Order items mini list */}
              <div className="mb-4 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center gap-2.5 py-2 first:pt-0 last:pb-0"
                  >
                    <div className="h-10 w-8 shrink-0 overflow-hidden rounded bg-muted">
                      {getVariantImage(item.productId, item.color) ? (
                        <img
                          src={getVariantImage(item.productId, item.color)!}
                          alt={item.productId.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[8px] font-bold text-muted-foreground">
                          {item.productId.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {item.productId.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.color} · {item.size} · Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-foreground shrink-0">
                      ₹{item.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="mb-3" />

              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({totalItems} items)
                  </span>
                  <span className="font-medium text-foreground">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-600">
                      Coupon ({appliedCoupon})
                    </span>
                    <span className="font-medium text-emerald-600">
                      -₹{discountAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-emerald-600">Free</span>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-foreground">
                    Total
                  </span>
                  <span className="text-xl font-bold text-foreground">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Delivery address confirmation */}
              {selectedAddr && (
                <div className="mt-4 rounded-lg bg-muted/50 border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Delivering to
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {selectedAddr.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedAddr.city}, {selectedAddr.state} -{" "}
                    {selectedAddr.pinCode}
                  </p>
                </div>
              )}

              <Button
                className="mt-5 w-full gap-2"
                size="lg"
                onClick={handlePayNow}
                disabled={!selectedAddressId || isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Pay ₹{totalAmount.toLocaleString("en-IN")}
                  </>
                )}
              </Button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5" />
                Secured by Razorpay
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================== */
  /* RENDER: CART STEP                                                   */
  /* ================================================================== */

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Cart Items */}
      <div className="flex-1">
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 sm:p-6 pb-0">
            <h2 className="text-lg font-semibold text-foreground">
              Cart Items ({totalItems})
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {items.map((item, index) => {
                const product = item.productId;
                const image = getVariantImage(product, item.color);
                const stock = getItemStock(product, item.color, item.size);
                const discount =
                  product.mrp > product.price
                    ? Math.round(
                      ((product.mrp - product.price) / product.mrp) * 100,
                    )
                    : 0;

                return (
                  <div key={item._id}>
                    <div className="flex gap-3 sm:gap-4">
                      {/* Product Image */}
                      <a
                        href={`/products/${product._id}`}
                        className="block shrink-0"
                      >
                        <div className="relative h-24 w-20 sm:h-28 sm:w-24 overflow-hidden rounded-lg bg-muted">
                          {image ? (
                            <img
                              src={image}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                              {product.name.substring(0, 3).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </a>

                      {/* Product Details */}
                      <div className="flex flex-1 flex-col min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <a
                              href={`/products/${product._id}`}
                              className="hover:underline"
                            >
                              <h3 className="text-sm font-medium text-foreground leading-snug line-clamp-2">
                                {product.name}
                              </h3>
                            </a>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                {item.color}
                              </span>
                              <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                Size: {item.size}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item._id)}
                            disabled={deleteItemMutation.isPending}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                            aria-label={`Remove ${product.name}`}
                          >
                            {deleteItemMutation.isPending ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-sm font-semibold text-foreground">
                            ₹{product.price.toLocaleString("en-IN")}
                          </span>
                          {discount > 0 && (
                            <>
                              <span className="text-xs text-muted-foreground line-through">
                                ₹{product.mrp.toLocaleString("en-IN")}
                              </span>
                              <span className="text-[11px] font-medium text-emerald-600">
                                {discount}% off
                              </span>
                            </>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2.5">
                          <div className="flex items-center gap-0.5 rounded-lg border border-border w-fit">
                            <button
                              onClick={() => updateQuantity(item._id, -1)}
                              disabled={
                                updateQuantityMutation.isPending ||
                                item.quantity <= 1
                              }
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, 1)}
                              disabled={
                                updateQuantityMutation.isPending ||
                                item.quantity >= stock
                              }
                              className="flex h-7 w-7 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {stock > 0 && stock <= 3 && (
                            <span className="text-[10px] font-medium text-amber-600">
                              Only {stock} left
                            </span>
                          )}

                          <span className="text-sm font-semibold text-foreground">
                            ₹{item.totalPrice.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    {index < items.length - 1 && (
                      <Separator className="mt-4" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Summary Sidebar */}
      <div className="w-full lg:w-96">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">
            Order Summary
          </h2>
          <Separator className="my-4" />

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Items</span>
              <span className="font-medium text-foreground">{totalItems}</span>
            </div>

            {productSavings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total MRP</span>
                <span className="font-medium text-muted-foreground line-through">
                  ₹{mrpTotal.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                ₹{subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {productSavings > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-emerald-600">Product Discount</span>
                <span className="font-medium text-emerald-600">
                  -₹{productSavings.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {/* Coupon Section */}
            <CouponSection
              appliedCoupon={appliedCoupon}
              couponData={couponData}
              couponInput={couponInput}
              couponError={couponError}
              showCouponInput={showCouponInput}
              couponSuccess={couponSuccess}
              isApplying={applyCouponMutation.isPending}
              discountAmount={discountAmount}
              onApply={applyCoupon}
              onRemove={removeCoupon}
              onInputChange={setCouponInput}
              onToggleInput={() => setShowCouponInput(!showCouponInput)}
            />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-emerald-600">Free</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">
                Total
              </span>
              <span className="text-xl font-bold text-foreground">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>

            {productSavings + discountAmount > 0 && (
              <p className="text-xs text-emerald-600 font-medium text-right">
                You save ₹
                {(productSavings + discountAmount).toLocaleString("en-IN")} on
                this order
              </p>
            )}
          </div>

          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={handleProceedToCheckout}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================== */
/* COUPON SECTION                                                        */
/* ===================================================================== */

interface CouponSectionProps {
  appliedCoupon: string | null;
  couponData: CouponApiResponse | null;
  couponInput: string;
  couponError: string;
  showCouponInput: boolean;
  couponSuccess: boolean;
  isApplying: boolean;
  discountAmount: number;
  onApply: (code: string) => void;
  onRemove: () => void;
  onInputChange: (value: string) => void;
  onToggleInput: () => void;
}

function CouponSection({
  appliedCoupon,
  couponData,
  couponInput,
  couponError,
  showCouponInput,
  couponSuccess,
  isApplying,
  discountAmount,
  onApply,
  onRemove,
  onInputChange,
  onToggleInput,
}: CouponSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showCouponInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showCouponInput]);

  /* ---- Applied coupon display ---- */
  if (appliedCoupon && couponData) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border p-3.5 transition-all duration-500",
          couponSuccess
            ? "border-emerald-400 bg-emerald-500/10"
            : "border-emerald-500/30 bg-emerald-500/5",
        )}
      >
        {/* Shimmer on success */}
        {couponSuccess && (
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-emerald-200/30 to-transparent" />
        )}

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-wider text-emerald-700 dark:text-emerald-400 font-mono">
                    {appliedCoupon}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                    Applied
                  </span>
                </div>
                <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                  {couponData.offer}
                </p>
              </div>
            </div>
            <button
              onClick={onRemove}
              className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-emerald-500/20 transition-colors text-emerald-600 dark:text-emerald-400"
              aria-label="Remove coupon"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Savings row */}
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-emerald-500/10 px-3 py-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                Coupon Savings
              </span>
            </div>
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              -₹{discountAmount.toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Coupon input field ---- */
  return (
    <div className="flex flex-col gap-2.5">
      {/* Toggle button */}
      <button
        onClick={onToggleInput}
        className={cn(
          "group flex items-center justify-center gap-2.5 w-full rounded-xl border-2 border-dashed py-3 text-sm font-medium transition-all duration-200",
          showCouponInput
            ? "border-primary/40 bg-primary/5 text-primary"
            : "border-muted-foreground/25 bg-muted/30 text-muted-foreground hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
        )}
      >
        <BadgePercent
          className={cn(
            "h-4.5 w-4.5 transition-transform duration-200",
            showCouponInput ? "rotate-12" : "group-hover:rotate-12",
          )}
        />
        {showCouponInput ? "Enter Coupon Code" : "Have a Coupon Code?"}
      </button>

      {/* Input area with slide animation */}
      {showCouponInput && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="rounded-xl border border-border bg-muted/30 p-3.5">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={couponInput}
                  onChange={(e) => onInputChange(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && !isApplying && onApply(couponInput)}
                  disabled={isApplying}
                  className={cn(
                    "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm font-mono tracking-wider",
                    "placeholder:text-muted-foreground/50 placeholder:font-sans placeholder:tracking-normal",
                    "outline-none transition-all duration-200",
                    "focus:ring-2 focus:ring-primary/20 focus:border-primary/50",
                    couponError
                      ? "border-destructive/50 focus:ring-destructive/20 focus:border-destructive/50"
                      : "border-border",
                    isApplying && "opacity-60 cursor-not-allowed",
                  )}
                />
                {couponInput && !isApplying && (
                  <button
                    onClick={() => onInputChange("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <Button
                size="default"
                onClick={() => onApply(couponInput)}
                disabled={isApplying || !couponInput.trim()}
                className="shrink-0 min-w-[80px] gap-1.5"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span className="sr-only sm:not-sr-only">Applying</span>
                  </>
                ) : (
                  "Apply"
                )}
              </Button>
            </div>

            {/* Error message */}
            {couponError && (
              <div className="mt-2.5 flex items-start gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-destructive">
                  {couponError}
                </p>
              </div>
            )}

            {/* Helper hint */}
            {!couponError && (
              <p className="mt-2 text-[11px] text-muted-foreground/70">
                Enter your coupon code and click Apply to get a discount.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
