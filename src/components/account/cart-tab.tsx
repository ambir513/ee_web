"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  productId: {
    _id: string;
    name: string;
    price: number;
    images?: string[];
  };
  quantity: number;
  totalPrice: number;
}

// Sample valid coupons with different discount types
const validCoupons: Record<
  string,
  { discount: number; type: "percentage" | "fixed" }
> = {
  SAVE10: { discount: 10, type: "percentage" },
  SAVE15: { discount: 15, type: "percentage" },
  FLAT500: { discount: 500, type: "fixed" },
  WELCOME20: { discount: 20, type: "percentage" },
  FLAT300: { discount: 300, type: "fixed" },
  SUMMER25: { discount: 25, type: "percentage" },
};

export function CartTab() {
  const queryClient = useQueryClient();
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Fetch cart items from API
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
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnMount: false, // Don't refetch on every tab switch
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    retry: false,
  });

  // Update quantity mutation
  const updateQuantityMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      return api.post(`/addtocart/update/${productId}`, { quantity }, { queryClient });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart"] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      return api.delete(`/addtocart/delete/${productId}`, { queryClient });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getCart"] });
    },
  });

  const items: CartItem[] = cartData?.data || [];

  const updateQuantity = (productId: string, delta: number) => {
    const item = items.find((i) => i.productId._id === productId);
    if (item) {
      const newQuantity = Math.max(1, item.quantity + delta);
      updateQuantityMutation.mutate({ productId, quantity: newQuantity });
    }
  };

  const removeItem = (productId: string) => {
    deleteItemMutation.mutate(productId);
  };

  const applyCoupon = (couponCode: string) => {
    const trimmedCode = couponCode.trim().toUpperCase();

    if (!trimmedCode) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (validCoupons[trimmedCode]) {
      setAppliedCoupon(trimmedCode);
      setCouponError("");
      setCouponInput("");
      setShowCouponInput(false);
    } else {
      setCouponError("Invalid coupon code");
      setAppliedCoupon(null);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    setCouponInput("");
    setShowCouponInput(false);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

  // Calculate discount
  let discountAmount = 0;
  if (appliedCoupon && validCoupons[appliedCoupon]) {
    const coupon = validCoupons[appliedCoupon];
    discountAmount =
      coupon.type === "percentage"
        ? Math.floor((subtotal * coupon.discount) / 100)
        : coupon.discount;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount);

  // Loading state
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

  // Empty cart or error state
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

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Cart Items - Main Content */}
      <div className="flex-1">
        <div className="rounded-xl border border-border bg-card">
          <div className="p-4 sm:p-6 pb-0">
            <h2 className="text-lg font-semibold text-foreground">
              Cart Items ({totalItems})
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {items.map((item, index) => (
                <div key={item.productId._id}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    {/* Product image placeholder */}
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted text-sm font-semibold text-muted-foreground">
                      {item.productId.images && item.productId.images[0] ? (
                        <img
                          src={item.productId.images[0]}
                          alt={item.productId.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        item.productId.name.substring(0, 3).toUpperCase()
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-medium text-foreground">
                            {item.productId.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {"Rs."} {item.productId.price.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span className="font-semibold text-foreground">
                          {"Rs."} {item.totalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>

                      {/* Quantity controls and remove button */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded-lg border border-border w-fit">
                          <button
                            onClick={() => updateQuantity(item.productId._id, -1)}
                            disabled={updateQuantityMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId._id, 1)}
                            disabled={updateQuantityMutation.isPending}
                            className="flex h-8 w-8 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => removeItem(item.productId._id)}
                          disabled={deleteItemMutation.isPending}
                          className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ml-auto sm:ml-0 disabled:opacity-50"
                          aria-label={`Remove ${item.productId.name}`}
                        >
                          {deleteItemMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  {index < items.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
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
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium text-foreground">
                {"Rs."} {subtotal.toLocaleString("en-IN")}
              </span>
            </div>

            {/* Coupon Section */}
            {appliedCoupon ? (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      {appliedCoupon} Applied
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-emerald-200 transition-colors text-emerald-600"
                    aria-label="Remove coupon"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-emerald-700">Discount</span>
                  <span className="font-semibold text-emerald-700">
                    -Rs. {discountAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCouponInput(!showCouponInput)}
                className="flex items-center justify-center gap-2 w-full rounded-lg border border-dashed border-amber-300 bg-amber-50 py-2.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-100"
              >
                <Ticket className="h-4 w-4" />
                Add Coupon Code
              </button>
            )}

            {showCouponInput && !appliedCoupon && (
              <CouponInputField
                onApply={applyCoupon}
                error={couponError}
                value={couponInput}
                onChange={setCouponInput}
              />
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-foreground">Free</span>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-foreground">
                Total
              </span>
              <span className="text-xl font-bold text-foreground">
                {"Rs."} {totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Button className="mt-6 w-full" size="lg">
            Proceed to Checkout
          </Button>

          {/* Coupon Suggestions */}
          {!appliedCoupon && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">
                Try these codes:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(validCoupons)
                  .slice(0, 3)
                  .map((code) => (
                    <button
                      key={code}
                      onClick={() => {
                        applyCoupon(code);
                      }}
                      className="text-xs font-medium px-2 py-1 rounded border border-border bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      {code}
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CouponInputFieldProps {
  onApply: (code: string) => void;
  error: string;
  value: string;
  onChange: (value: string) => void;
}

function CouponInputField({
  onApply,
  error,
  value,
  onChange,
}: CouponInputFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
        <input
          type="text"
          placeholder="Enter coupon code"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            // Clear error when user starts typing
            if (error) {
              onChange(e.target.value);
            }
          }}
          onKeyDown={(e) => e.key === "Enter" && onApply(value)}
          className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm placeholder-amber-600 outline-none transition-colors focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
        />
        <Button
          size="sm"
          onClick={() => onApply(value)}
          className="w-full sm:w-auto"
        >
          Apply
        </Button>
      </div>
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
