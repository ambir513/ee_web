"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/lib/api";
import { Search, Loader2, Package, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 10;

interface Product {
  _id: string;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  mrp: number;
}

interface ProductSelectorProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  maxSelection?: number;
}

export function ProductSelector({
  selectedIds,
  onSelectionChange,
  maxSelection,
}: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const selectAllCheckboxRef = useRef<HTMLButtonElement>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("limit", "50");
      if (categoryFilter) params.append("category", categoryFilter);

      const response = await api.get(`/product/filter?${params.toString()}`);

      if (response?.status && response.data) {
        // API returns { products, total }; support legacy array shape
        const list = Array.isArray(response.data)
          ? response.data
          : (response.data as { products?: Product[] })?.products ?? [];
        setProducts(Array.isArray(list) ? list : []);
      } else {
        setError("Failed to load products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Filter products by search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const currentPageProducts = filteredProducts.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFilter]);

  // Toggle product selection
  const toggleProduct = (productId: string) => {
    if (selectedIds.includes(productId)) {
      onSelectionChange(selectedIds.filter((id) => id !== productId));
    } else {
      if (maxSelection && selectedIds.length >= maxSelection) {
        return; // Don't add more if max reached
      }
      onSelectionChange([...selectedIds, productId]);
    }
  };

  // Toggle select all filtered products
  const toggleSelectAll = () => {
    const filteredProductIds = filteredProducts.map((p) => p._id);
    const allSelected = filteredProductIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      // Deselect all filtered products
      onSelectionChange(selectedIds.filter((id) => !filteredProductIds.includes(id)));
    } else {
      // Select all filtered products (respecting maxSelection limit)
      const newSelections = [...selectedIds];
      for (const id of filteredProductIds) {
        if (!newSelections.includes(id)) {
          if (maxSelection && newSelections.length >= maxSelection) {
            break; // Stop if max reached
          }
          newSelections.push(id);
        }
      }
      onSelectionChange(newSelections);
    }
  };

  // Remove selected product
  const removeProduct = (productId: string) => {
    onSelectionChange(selectedIds.filter((id) => id !== productId));
  };

  // Get selected products info
  const selectedProducts = products.filter((p) => selectedIds.includes(p._id));

  // Check if all filtered products are selected
  const filteredProductIds = filteredProducts.map((p) => p._id);
  const allFilteredSelected = filteredProducts.length > 0 && filteredProductIds.every((id) => selectedIds.includes(id));
  const someFilteredSelected = filteredProductIds.some((id) => selectedIds.includes(id));
  const isIndeterminate = someFilteredSelected && !allFilteredSelected;

  // Set indeterminate state on the checkbox element
  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      // Try to find the input element within the checkbox
      const checkboxElement = selectAllCheckboxRef.current as HTMLElement;
      // Check if it's a button element (base-ui uses button for checkbox)
      if (checkboxElement) {
        // Try to set indeterminate on the element itself or find nested input
        const input = (checkboxElement.querySelector?.('input[type="checkbox"]') ||
                     checkboxElement.querySelector?.('input') ||
                     (checkboxElement.tagName === 'INPUT' ? checkboxElement : null)) as HTMLInputElement | null;
        if (input) {
          input.indeterminate = isIndeterminate;
        } else if (checkboxElement.setAttribute) {
          // Set data attribute as fallback
          checkboxElement.setAttribute('data-indeterminate', String(isIndeterminate));
        }
      }
    }
  }, [isIndeterminate, allFilteredSelected]);

  return (
    <div className="space-y-4">
      {/* Selected Products */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProducts.map((product) => (
            <div
              key={product._id}
              className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-sm rounded-md"
            >
              <span className="max-w-[150px] truncate">{product.name}</span>
              <button
                type="button"
                onClick={() => removeProduct(product._id)}
                className="hover:bg-primary/20 rounded p-0.5"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-input bg-background text-sm"
        >
          <option value="">All Categories</option>
          <option value="MEN">Men</option>
          <option value="WOMEN">Women</option>
          <option value="KIDS">Kids</option>
        </select>
      </div>

      {/* Product List */}
      <div className="border rounded-lg max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-destructive text-sm">{error}</p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={fetchProducts}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Package className="size-8 text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground text-sm">No products found</p>
          </div>
        ) : (
          <div className="divide-y">
            {/* Select All Checkbox */}
            <label
              className={cn(
                "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b bg-muted/30",
                "hover:bg-muted/50"
              )}
            >
              <Checkbox
                checked={allFilteredSelected}
                onCheckedChange={toggleSelectAll}
                ref={selectAllCheckboxRef}
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  Select All ({filteredProducts.length} products)
                </p>
              </div>
            </label>
            {currentPageProducts.map((product) => {
              const isSelected = selectedIds.includes(product._id);
              const isDisabled = Boolean(
                !isSelected && maxSelection && selectedIds.length >= maxSelection
              );

              return (
                <label
                  key={product._id}
                  className={cn(
                    "flex items-center gap-3 p-3 cursor-pointer transition-colors",
                    isSelected
                      ? "bg-primary/5"
                      : "hover:bg-muted/50",
                    isDisabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => !isDisabled && toggleProduct(product._id)}
                    disabled={isDisabled}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.category} • {product.subCategory} • ₹{product.price}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {filteredProducts.length > PAGE_SIZE && (
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <span>
            Showing {startIndex + 1}-
            {Math.min(startIndex + PAGE_SIZE, filteredProducts.length)} of{" "}
            {filteredProducts.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={safePage === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              ‹
            </Button>
            <span>
              Page {safePage} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((prev) => Math.min(totalPages, prev + 1))
              }
            >
              ›
            </Button>
          </div>
        </div>
      )}

      {/* Selection Count */}
      <p className="text-xs text-muted-foreground text-right">
        {selectedIds.length} product{selectedIds.length !== 1 ? "s" : ""} selected
        {maxSelection && ` (max ${maxSelection})`}
      </p>
    </div>
  );
}
