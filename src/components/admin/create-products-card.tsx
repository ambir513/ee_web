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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { VariantSheet } from "./variant-sheet";
import { api } from "@/lib/api";
import { ImageUpload } from "./image-uploader";
import { Loader2, CheckCircle2 } from "lucide-react";

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

export default function CreateProductCard() {
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [response, setResponse] = useState<{ id: string }>({
    id: "",
  });
  const [error, setError] = useState<string | null>(null);

  const handleImagesChange = (images: string[]) => {
    setData((prev) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const finalData = {
        ...data,
        price: Number(data.price),
        mrp: Number(data.mrp),
        category: data.category?.toString().toUpperCase(),
        subCategory: data.subCategory?.toString().toUpperCase(),
      };

      const response = await api.post("/admin/product/create", finalData);

      if (!response?.status) {
        setError(response?.message || "Error creating product");
        setIsLoading(false);
        return;
      }

      console.log("Product created:", response);
      // MongoDB returns _id, not id
      setResponse({ id: response.data._id || response.data.id });
      setIsSuccess(true);
    } catch (err) {
      console.error("Error creating product:", err);
      setError("Failed to create product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setData({
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
    setIsSuccess(false);
    setResponse({ id: "" });
    setError(null);
  };

  // If product was created successfully, show success view with VariantSheet
  if (isSuccess) {
    console.log("Success state - Product ID:", response.id);
    
    return (
      <Card className="mx-5 sm:mx-auto sm:max-w-2xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Product Created!</CardTitle>
          <CardDescription>
            Your product has been created successfully. Now add variants to it.
          </CardDescription>
        </CardHeader>
        <CardPanel>
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-green-500" />
                <p className="text-green-600 font-medium">
                  Product created successfully!
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Product ID: {response.id || "Not available"}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleReset}
              >
                Create Another Product
              </Button>
              <VariantSheet
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                productId={response.id}
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
        <CardTitle className="text-2xl font-bold">Create Product</CardTitle>
        <CardDescription>
          Fill in the product details below to add a new item to your store.
        </CardDescription>
      </CardHeader>
      <CardPanel>
        <Form className="grid gap-5 sm:grid-cols-2" onSubmit={handleSubmit}>
          {/* Image Upload Section */}
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
                Upload up to 5 product images. First image will be the main
                display.
              </FieldDescription>
            </Field>
          </div>

          {/* Category */}
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
            <FieldDescription>Select the main category.</FieldDescription>
          </Field>

          {/* Sub Category */}
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

          {/* Design */}
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
            <FieldDescription>Select the design pattern.</FieldDescription>
          </Field>

          {/* Label */}
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

          {/* Name */}
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

          {/* Description */}
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="description">Description</FieldLabel>
            <FieldItem className="w-full">
              <Textarea
                id="description"
                name="description"
                placeholder="Elegant and comfortable kurta set perfect for festive occasions..."
                value={data.description}
                className="w-full min-h-[100px]"
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
              />
            </FieldItem>
          </Field>

          {/* Product Information */}
          <Field className="sm:col-span-2">
            <FieldLabel htmlFor="productInformation">
              Product Information
            </FieldLabel>
            <FieldItem className="w-full">
              <Textarea
                id="productInformation"
                name="productInformation"
                placeholder="Material: 100% Cotton&#10;Care: Machine washable&#10;Fit: Regular fit"
                value={data.productInformation}
                className="min-h-[80px]"
                onChange={(e) =>
                  setData({ ...data, productInformation: e.target.value })
                }
              />
            </FieldItem>
          </Field>

          {/* Price */}
          <Field>
            <FieldLabel htmlFor="price">Selling Price (₹)</FieldLabel>
            <FieldItem className="w-full">
              <Input
                id="price"
                name="price"
                type="number"
                onChange={(e) => setData({ ...data, price: e.target.value })}
                min={0}
                placeholder="1299"
                value={data.price}
              />
            </FieldItem>
          </Field>

          {/* MRP */}
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

          {/* SKU */}
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

          {/* Error Message */}
          {error && (
            <div className="sm:col-span-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit Section */}
          <div className="my-4 sm:col-span-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating Product...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </Form>
      </CardPanel>
    </Card>
  );
}
