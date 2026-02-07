"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPanel,
  SheetPopup,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageUpload } from "./image-uploader";
import { useState } from "react";
import { api } from "@/lib/api";
import { Loader2, Plus, Trash2 } from "lucide-react";

interface SizeStock {
  size: string;
  stock: string;
}

interface VariantData {
  color: string;
  sizes: SizeStock[];
  images: string[];
}

export function VariantSheet({
  isOpen,
  setIsOpen,
  productId,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  productId?: string;
}) {
  const [variantData, setVariantData] = useState<VariantData>({
    color: "",
    sizes: [{ size: "", stock: "" }],
    images: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof VariantData, value: any) => {
    setVariantData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizeChange = (index: number, field: keyof SizeStock, value: string) => {
    setVariantData((prev) => {
      const newSizes = [...prev.sizes];
      newSizes[index] = { ...newSizes[index], [field]: value };
      return { ...prev, sizes: newSizes };
    });
  };

  const addSize = () => {
    setVariantData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", stock: "" }],
    }));
  };

  const removeSize = (index: number) => {
    if (variantData.sizes.length > 1) {
      setVariantData((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((_, i) => i !== index),
      }));
    }
  };

  const handleImagesChange = (images: string[]) => {
    setVariantData((prev) => ({ ...prev, images }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!productId) {
      setError("Product ID is missing");
      return;
    }

    if (!variantData.color.trim()) {
      setError("Color is required");
      return;
    }

    if (variantData.images.length === 0) {
      setError("At least one image is required");
      return;
    }

    const validSizes = variantData.sizes.filter(
      (s) => s.size.trim() && s.stock.trim()
    );

    if (validSizes.length === 0) {
      setError("At least one size with stock is required");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        color: variantData.color,
        images: variantData.images,
        size: validSizes.map((s) => ({
          size: s.size,
          stock: Number(s.stock),
        })),
      };

      const response = await api.post(
        `/admin/product/variant/add/${productId}`,
        payload
      );

      if (!response?.status) {
        setError(response?.message || "Failed to add variant");
        return;
      }

      // Reset form and close sheet on success
      setVariantData({
        color: "",
        sizes: [{ size: "", stock: "" }],
        images: [],
      });
      setIsOpen(false);
    } catch (err) {
      console.error("Error adding variant:", err);
      setError("Failed to add variant. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger
        render={
          <Button
            variant="default"
            className="flex-1"
            onClick={() => setIsOpen(true)}
          />
        }
      >
        Add Variants
      </SheetTrigger>
      <SheetPopup variant="inset" className="max-w-3xl">
        <form className="h-full flex flex-col gap-0" onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Add Product Variant</SheetTitle>
            <SheetDescription>
              Add color variants with sizes, stock, and images. Each variant
              represents a different color option.
            </SheetDescription>
          </SheetHeader>
          <SheetPanel className="grid gap-5 overflow-y-auto">
            {/* Color Input */}
            <Field>
              <FieldLabel>Color Name</FieldLabel>
              <Input
                value={variantData.color}
                onChange={(e) => handleInputChange("color", e.target.value)}
                placeholder="e.g., Navy Blue, Maroon, Forest Green"
              />
              <FieldDescription>
                Enter the color name for this variant.
              </FieldDescription>
            </Field>

            {/* Size & Stock Inputs */}
            <div className="space-y-3">
              <Field>
                <FieldLabel>Sizes & Stock</FieldLabel>
              </Field>
              {variantData.sizes.map((sizeItem, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <Field className="flex-1">
                    <Input
                      value={sizeItem.size}
                      onChange={(e) =>
                        handleSizeChange(index, "size", e.target.value)
                      }
                      placeholder="Size (S, M, L, XL...)"
                    />
                  </Field>
                  <Field className="flex-1">
                    <Input
                      type="number"
                      value={sizeItem.stock}
                      onChange={(e) =>
                        handleSizeChange(index, "stock", e.target.value)
                      }
                      placeholder="Stock quantity"
                      min={0}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSize(index)}
                    disabled={variantData.sizes.length === 1}
                    className="shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSize}
                className="w-full"
              >
                <Plus className="size-4 mr-2" />
                Add Another Size
              </Button>
            </div>

            {/* Image Upload */}
            <Field>
              <FieldLabel>Variant Images</FieldLabel>
              <div className="mt-2">
                <ImageUpload
                  onImagesChange={handleImagesChange}
                  maxImages={5}
                  initialImages={variantData.images}
                />
              </div>
              <FieldDescription>
                Upload images showing this color variant from different angles.
              </FieldDescription>
            </Field>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </SheetPanel>
          <SheetFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Variant"
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetPopup>
    </Sheet>
  );
}
