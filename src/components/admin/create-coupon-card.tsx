"use client";

import React, { useState } from "react";

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
import { Loader2, CheckCircle2, Ticket, Calendar, Percent, Tag, Package } from "lucide-react";

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

export default function CreateCouponCard() {
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdCoupon, setCreatedCoupon] = useState<any>(null);

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

      const response = await api.post("/admin/coupon/create", payload);

      if (!response?.status) {
        setError(response?.message || "Error creating coupon");
        setIsLoading(false);
        return;
      }

      console.log("Coupon created:", response);
      setCreatedCoupon(response.data);
      setIsSuccess(true);
    } catch (err) {
      console.error("Error creating coupon:", err);
      setError("Failed to create coupon. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData({
      code: "",
      discount: "",
      minOrderValue: "",
      usageLimit: "",
      validFrom: "",
      validTill: "",
      isActive: true,
      applicableTo: [],
    });
    setIsSuccess(false);
    setCreatedCoupon(null);
    setError(null);
  };

  // Success View
  if (isSuccess) {
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Ticket className="size-6 text-green-500" />
            Coupon Created!
          </CardTitle>
          <CardDescription>
            Your coupon has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                <p className="text-green-600 font-medium">
                  Coupon created successfully!
                </p>
              </div>
              {createdCoupon && (
                <div className="text-sm space-y-1">
                  <p><strong>Code:</strong> {createdCoupon.code}</p>
                  <p><strong>Discount:</strong> {createdCoupon.discount}%</p>
                  <p><strong>Min Order:</strong> ₹{createdCoupon.minOrderValue}</p>
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleReset}
            >
              Create Another Coupon
            </Button>
          </div>
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card className="mx-5 sm:mx-auto sm:max-w-xl shadow-lg">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Ticket className="size-6" />
          Create Coupon
        </CardTitle>
        <CardDescription>
          Create a new discount coupon for your customers.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <Form className="grid gap-5" onSubmit={handleSubmit}>
          {/* Coupon Code */}
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
            <FieldDescription>
              A unique code customers will enter at checkout.
            </FieldDescription>
          </Field>

          {/* Discount & Min Order Value Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Discount */}
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

            {/* Min Order Value */}
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

          {/* Usage Limit */}
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
            <FieldDescription>
              Maximum number of times this coupon can be used.
            </FieldDescription>
          </Field>

          {/* Valid From & Valid Till Row */}
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Valid From */}
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

            {/* Valid Till */}
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

          {/* Applicable Products */}
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
            <FieldDescription>
              Select the products this coupon can be applied to.
            </FieldDescription>
          </Field>

          {/* Is Active Toggle */}
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

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Creating Coupon...
              </>
            ) : (
              "Create Coupon"
            )}
          </Button>
        </Form>
      </CardPanel>
    </Card>
  );
}
