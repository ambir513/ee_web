"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Field,
  FieldLabel,
  FieldItem,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ProductSelector } from "./product-selector";
import { api } from "@/lib/api";
import {
  Loader2,
  CheckCircle2,
  Ticket,
  Calendar,
  Percent,
  Tag,
  Package,
  ArrowLeft,
} from "lucide-react";

interface CouponFormData {
  code: string;
  discount: string;
  minOrderValue: string;
  usageLimit: string;
  validFrom: string;
  validTill: string;
  isActive: boolean;
  applicableTo: string[];
}

interface EditCouponCardProps {
  couponId: string;
}

function formatDateForInput(dateString: string) {
  const d = new Date(dateString);
  return d.toISOString().split("T")[0];
}

export default function EditCouponCard({ couponId }: EditCouponCardProps) {
  const [data, setData] = useState<CouponFormData>({
    code: "",
    discount: "",
    minOrderValue: "",
    usageLimit: "",
    validFrom: "",
    validTill: "",
    isActive: true,
    applicableTo: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCoupon = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await api.get(`/admin/coupon/${couponId}`);

      if (!response?.status) {
        setFetchError(response?.message || "Failed to load coupon");
        setIsFetching(false);
        return;
      }

      const coupon = response.data;
      setData({
        code: coupon.code || "",
        discount: String(coupon.discount ?? ""),
        minOrderValue: String(coupon.minOrderValue ?? ""),
        usageLimit: String(coupon.usageLimit ?? ""),
        validFrom: formatDateForInput(coupon.validFrom),
        validTill: formatDateForInput(coupon.validTill),
        isActive: coupon.isActive ?? true,
        applicableTo: (coupon.applicableTo || []).map((id: string | { toString?: () => string }) =>
          typeof id === "string" ? id : String(id)
        ),
      });
    } catch (err) {
      console.error("Error fetching coupon:", err);
      setFetchError("Failed to load coupon");
    } finally {
      setIsFetching(false);
    }
  }, [couponId]);

  useEffect(() => {
    fetchCoupon();
  }, [fetchCoupon]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        code: data.code.toUpperCase(),
        discount: Number(data.discount),
        minOrderValue: Number(data.minOrderValue),
        usageLimit: Number(data.usageLimit),
        validFrom: data.validFrom,
        validTill: data.validTill,
        isActive: data.isActive,
        applicableTo: data.applicableTo,
      };

      const response = await api.patch(
        `/admin/coupon/edit/${couponId}`,
        payload
      );

      if (!response?.status) {
        setError(response?.message || "Error updating coupon");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Error updating coupon:", err);
      setError("Failed to update coupon. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-xl shadow-lg">
        <CardPanel>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading coupon...</p>
          </div>
        </CardPanel>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-xl shadow-lg">
        <CardPanel>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-destructive mb-4">{fetchError}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchCoupon}>
                Retry
              </Button>
              <Link href="/admin/coupon">
                <Button variant="ghost">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to List
                </Button>
              </Link>
            </div>
          </div>
        </CardPanel>
      </Card>
    );
  }

  if (isSuccess) {
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="size-6 text-green-500" />
            Coupon Updated!
          </CardTitle>
          <CardDescription>
            Your coupon has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                <p className="text-green-600 font-medium">
                  Coupon updated successfully!
                </p>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Code:</strong> {data.code}</p>
                <p><strong>Discount:</strong> {data.discount}%</p>
                <p><strong>Min Order:</strong> ₹{data.minOrderValue}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/coupon" className="flex-1">
                <Button variant="outline" className="w-full">
                  Back to Coupons
                </Button>
              </Link>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsSuccess(false)}
              >
                Edit Again
              </Button>
            </div>
          </div>
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card className="mx-5 sm:mx-auto sm:max-w-xl shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/admin/coupon">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="size-6" />
              Edit Coupon
            </CardTitle>
            <CardDescription>
              Update discount coupon details.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardPanel>
        <Form className="grid gap-5" onSubmit={handleSubmit}>
          <Field>
            <FieldLabel htmlFor="code">
              <div className="flex items-center gap-1.5">
                <Tag className="size-3.5" />
                Coupon Code
              </div>
            </FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="code"
                name="code"
                placeholder="SUMMER25"
                value={data.code}
                onChange={(e) =>
                  setData({ ...data, code: e.target.value.toUpperCase() })
                }
                className="uppercase"
              />
            </FieldItem>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="discount">
                <div className="flex items-center gap-1.5">
                  <Percent className="size-3.5" />
                  Discount (%)
                </div>
              </FieldLabel>
              <FieldItem className="w-full">
                <Input
                  id="discount"
                  name="discount"
                  type="number"
                  min={0}
                  max={100}
                  placeholder="25"
                  value={data.discount}
                  onChange={(e) => setData({ ...data, discount: e.target.value })}
                />
              </FieldItem>
            </Field>

            <Field>
              <FieldLabel htmlFor="minOrderValue">Min Order (₹)</FieldLabel>
              <FieldItem className="w-full">
                <Input
                  id="minOrderValue"
                  name="minOrderValue"
                  type="number"
                  min={0}
                  placeholder="500"
                  value={data.minOrderValue}
                  onChange={(e) =>
                    setData({ ...data, minOrderValue: e.target.value })
                  }
                />
              </FieldItem>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="usageLimit">Usage Limit</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="usageLimit"
                name="usageLimit"
                type="number"
                min={1}
                placeholder="100"
                value={data.usageLimit}
                onChange={(e) => setData({ ...data, usageLimit: e.target.value })}
              />
            </FieldItem>
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="validFrom">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Valid From
                </div>
              </FieldLabel>
              <FieldItem className="w-full">
                <Input
                  id="validFrom"
                  name="validFrom"
                  type="date"
                  value={data.validFrom}
                  onChange={(e) => setData({ ...data, validFrom: e.target.value })}
                />
              </FieldItem>
            </Field>

            <Field>
              <FieldLabel htmlFor="validTill">
                <div className="flex items-center gap-1.5">
                  <Calendar className="size-3.5" />
                  Valid Till
                </div>
              </FieldLabel>
              <FieldItem className="w-full">
                <Input
                  id="validTill"
                  name="validTill"
                  type="date"
                  value={data.validTill}
                  onChange={(e) => setData({ ...data, validTill: e.target.value })}
                />
              </FieldItem>
            </Field>
          </div>

          <Field>
            <FieldLabel>
              <div className="flex items-center gap-1.5">
                <Package className="size-3.5" />
                Applicable Products
              </div>
            </FieldLabel>
            <FieldItem className="w-full mt-2">
              <ProductSelector
                selectedIds={data.applicableTo}
                onSelectionChange={(ids) =>
                  setData({ ...data, applicableTo: ids })
                }
              />
            </FieldItem>
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel htmlFor="isActive">Active Status</FieldLabel>
                <FieldDescription className="mt-0.5">
                  Enable or disable this coupon immediately.
                </FieldDescription>
              </div>
              <Switch
                id="isActive"
                name="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) =>
                  setData({ ...data, isActive: checked })
                }
              />
            </div>
          </Field>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Updating Coupon...
              </>
            ) : (
              "Update Coupon"
            )}
          </Button>
        </Form>
      </CardPanel>
    </Card>
  );
}
