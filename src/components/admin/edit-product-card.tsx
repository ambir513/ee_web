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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { VariantSheet } from "./variant-sheet";
import { api } from "@/lib/api";
import { ImageUpload } from "./image-uploader";
import { Loader2, CheckCircle2, ArrowLeft, Package } from "lucide-react";

interface ProductFormData {
  name: string;
  description: string;
  productInformation: string;
  category: string;
  subCategory: string;
  price: string;
  mrp: string;
  isActive: boolean;
  design: string;
  label: string;
  sku: string;
  images: string[];
}

interface Product {
  _id: string;
  name?: string;
  description?: string;
  productInformation?: string;
  category?: string;
  subCategory?: string;
  price?: number;
  mrp?: number;
  isActive?: boolean;
  design?: string;
  label?: string;
  sku?: string;
  images?: string[];
}

interface EditProductCardProps {
  productId: string;
}

export default function EditProductCard({ productId }: EditProductCardProps) {
  const [data, setData] = useState<ProductFormData>({
    name: "",
    description: "",
    productInformation: "",
    category: "",
    subCategory: "",
    price: "",
    mrp: "",
    isActive: false,
    design: "",
    label: "",
    sku: "",
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchProduct = useCallback(async () => {
    setIsFetching(true);
    setFetchError(null);

    try {
      const response = await api.get(`/admin/product/${productId}`);

      if (!response?.status || !response.data) {
        setFetchError(response?.message || "Failed to load product");
        setIsFetching(false);
        return;
      }

      const product = response.data as Product;
      setData({
        name: product.name ?? "",
        description: product.description ?? "",
        productInformation: product.productInformation ?? "",
        category: product.category ?? "",
        subCategory: product.subCategory ?? "",
        price: String(product.price ?? ""),
        mrp: String(product.mrp ?? ""),
        isActive: product.isActive ?? false,
        design: product.design ?? "",
        label: product.label ?? "",
        sku: product.sku ?? "",
        images: product.images ?? [],
      });
    } catch (err) {
      console.error("Error fetching product:", err);
      setFetchError("Failed to load product");
    } finally {
      setIsFetching(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleImagesChange = (images: string[]) => {
    setData((prev) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const payload = {
        name: data.name,
        description: data.description,
        productInformation: data.productInformation,
        category: data.category?.toString().toUpperCase(),
        subCategory: data.subCategory?.toString().toUpperCase(),
        price: Number(data.price),
        mrp: Number(data.mrp),
        isActive: data.isActive,
        design: data.design,
        label: data.label,
        sku: data.sku,
        images: data.images,
      };

      const response = await api.patch(
        `/admin/product/edit/${productId}`,
        payload
      );

      if (!response?.status) {
        setError(response?.message || "Error updating product");
        setIsLoading(false);
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Failed to update product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-2xl shadow-lg">
        <CardPanel>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </CardPanel>
      </Card>
    );
  }

  if (fetchError) {
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-2xl shadow-lg">
        <CardPanel>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="size-12 text-muted-foreground/50 mb-3" />
            <p className="text-destructive mb-4">{fetchError}</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchProduct}>
                Retry
              </Button>
              <Link href="/admin/product">
                <Button variant="ghost">
                  <ArrowLeft className="size-4 mr-1.5" />
                  Back to Products
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
      <Card className="mx-5 sm:mx-auto sm:max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="size-6 text-green-500" />
            Product Updated!
          </CardTitle>
          <CardDescription>
            Your product has been updated successfully.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="space-y-4">
            <div className="flex flex-col gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                <p className="text-green-600 font-medium">
                  Product updated successfully!
                </p>
              </div>
              <div className="text-sm space-y-1">
                <p><strong>Name:</strong> {data.name}</p>
                <p><strong>SKU:</strong> {data.sku}</p>
                <p><strong>Price:</strong> ₹{data.price}</p>
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setIsSuccess(false)}
              >
                Edit Again
              </Button>
              <Link href="/admin/product">
                <Button variant="outline">Back to Products</Button>
              </Link>
              <VariantSheet
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                productId={productId}
              />
            </div>
          </div>
        </CardPanel>
      </Card>
    );
  }

  return (
    <Card className="mx-5 sm:mx-auto sm:max-w-2xl shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Link href="/admin/product">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="size-6" />
              Edit Product
            </CardTitle>
            <CardDescription>
              Update product details below.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardPanel>
        <Form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="sm:col-span-2">
            <Field>
              <FieldLabel>Product Images</FieldLabel>
              <FieldItem className="w-full mt-2">
                <ImageUpload
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  initialImages={data.images}
                />
              </FieldItem>
              <FieldDescription>
                Upload up to 5 product images. First image will be the main display.
              </FieldDescription>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="category">Category</FieldLabel>
            <FieldItem className="w-full">
              <Select
                name="category"
                value={data.category}
                onValueChange={(value) => value && setData({ ...data, category: value })}
              >
                <SelectTrigger aria-label="Category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="MEN">Men</SelectItem>
                  <SelectItem value="WOMEN">Women</SelectItem>
                  <SelectItem value="KIDS">Kids</SelectItem>
                </SelectPopup>
              </Select>
            </FieldItem>
          </Field>

          <Field>
            <FieldLabel htmlFor="subCategory">Sub Category</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="subCategory"
                name="subCategory"
                placeholder="Enter sub-category"
                value={data.subCategory}
                onChange={(e) =>
                  setData({ ...data, subCategory: e.target.value })
                }
              />
            </FieldItem>
            <FieldDescription>
              E.g., Kurta, Shirt, Dress, etc.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="design">Design</FieldLabel>
            <FieldItem className="w-full">
              <Select
                name="design"
                value={data.design}
                onValueChange={(value) => value && setData({ ...data, design: value })}
              >
                <SelectTrigger aria-label="Design">
                  <SelectValue placeholder="Select design" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="Floral Print">Floral Print</SelectItem>
                  <SelectItem value="Ethnic Print">Ethnic Print</SelectItem>
                  <SelectItem value="Abstract Print">Abstract Print</SelectItem>
                  <SelectItem value="Solid">Solid</SelectItem>
                  <SelectItem value="Checks">Checks</SelectItem>
                  <SelectItem value="Stripes">Stripes</SelectItem>
                  <SelectItem value="Bandhani">Bandhani</SelectItem>
                  <SelectItem value="Leheriya">Leheriya</SelectItem>
                  <SelectItem value="Tie & Dye">Tie & Dye</SelectItem>
                  <SelectItem value="Block Print">Block Print</SelectItem>
                </SelectPopup>
              </Select>
            </FieldItem>
          </Field>

          <Field>
            <FieldLabel htmlFor="label">Label</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="label"
                name="label"
                placeholder="Enter label"
                value={data.label}
                onChange={(e) => setData({ ...data, label: e.target.value })}
              />
            </FieldItem>
            <FieldDescription>
              E.g., "New Arrival", "Bestseller"
            </FieldDescription>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="name">Product Name</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="name"
                name="name"
                placeholder="Classic Cotton Kurta Set"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </FieldItem>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <FieldItem className="w-full">
              <Textarea
                id="description"
                name="description"
                placeholder="Elegant and comfortable kurta set..."
                value={data.description}
                className="w-full min-h-[100px]"
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
              />
            </FieldItem>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="productInformation">
              Product Information
            </FieldLabel>
            <FieldItem className="w-full">
              <Textarea
                id="productInformation"
                name="productInformation"
                placeholder="Material, Care, Fit..."
                value={data.productInformation}
                className="min-h-[80px]"
                onChange={(e) =>
                  setData({ ...data, productInformation: e.target.value })
                }
              />
            </FieldItem>
          </Field>

          <Field>
            <FieldLabel htmlFor="price">Selling Price (₹)</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                placeholder="1299"
                value={data.price}
                onChange={(e) => setData({ ...data, price: e.target.value })}
              />
            </FieldItem>
          </Field>

          <Field>
            <FieldLabel htmlFor="mrp">MRP (₹)</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="mrp"
                name="mrp"
                type="number"
                min={0}
                placeholder="1999"
                value={data.mrp}
                onChange={(e) => setData({ ...data, mrp: e.target.value })}
              />
            </FieldItem>
          </Field>

          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="sku">SKU</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="sku"
                name="sku"
                type="text"
                placeholder="KURTA-W-001"
                value={data.sku}
                onChange={(e) => setData({ ...data, sku: e.target.value })}
              />
            </FieldItem>
            <FieldDescription>
              Unique stock keeping unit identifier.
            </FieldDescription>
          </Field>

          <Field className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <FieldLabel htmlFor="isActive">Active Status</FieldLabel>
                <FieldDescription className="mt-0.5">
                  Show or hide this product in your store.
                </FieldDescription>
              </div>
              <Switch
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) =>
                  setData({ ...data, isActive: checked })
                }
              />
            </div>
          </Field>

          {error && (
            <div className="sm:col-span-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="my-4 sm:col-span-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating Product...
                </>
              ) : (
                "Update Product"
              )}
            </Button>
          </div>
        </Form>
      </CardPanel>
    </Card>
  );
}
