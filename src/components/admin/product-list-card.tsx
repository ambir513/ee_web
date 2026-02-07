"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogBackdrop,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogClose,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectPopup,
  SelectItem,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import {
  Loader2,
  Package,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  subCategory: string;
  isActive: boolean;
  createdAt: string;
  variants?: Array<{ images?: string[] }>;
}

type FilterType = "all" | "category" | "status" | "priceRange" | "dateRange";
type SortOption = "name" | "price" | "createdAt";
type StatusFilter = "all" | "live" | "draft";

export default function ProductListCard() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("createdAt");
  const sortOrder = "desc" as const;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(limit));
      if (search) params.append("search", search);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priceMin) params.append("priceMin", priceMin);
      if (priceMax) params.append("priceMax", priceMax);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      params.append("sortBy", sortBy);
      params.append("sortOrder", sortOrder);

      const response = await api.get(
        `/admin/product/list?${params.toString()}`,
      );

      if (response?.status && response.data?.products) {
        setProducts(response.data.products);
        setTotal(
          response.data.pagination?.total ?? response.data.products.length,
        );
      } else {
        setError(response?.message || "Failed to load products");
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [
    page,
    search,
    categoryFilter,
    statusFilter,
    priceMin,
    priceMax,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(products.map((p) => p._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelect = (id: string, checked: boolean) => {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    setSelectedIds(next);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    const productId = productToDelete._id;
    setDeletingId(productId);

    try {
      const response = await api.delete(`/admin/product/delete/${productId}`);

      if (response?.status) {
        setProducts((prev) => prev.filter((p) => p._id !== productId));
        closeDeleteDialog();
      } else {
        alert(response?.message || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getProductImage = (product: Product) => {
    const img =
      (product as Product & { images?: string[] }).images?.[0] ??
      product.variants?.[0]?.images?.[0];
    return img || null;
  };

  return (
    <Card className="mx-5 sm:mx-auto sm:max-w-6xl shadow-lg">
      <CardHeader className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Package className="size-6" />
              Products
            </CardTitle>
            <CardDescription>Manage your product catalog</CardDescription>
          </div>
          <Link href="/admin/product/create">
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search product..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { key: "all", label: "All" },
                { key: "category", label: "Category" },
                { key: "status", label: "Status" },
                { key: "priceRange", label: "Price Range" },
                { key: "dateRange", label: "Date Range" },
              ] as const
            ).map(({ key, label }) => (
              <Button
                key={key}
                variant={activeFilter === key ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveFilter(key)}
              >
                {label}
              </Button>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort By</span>
              <Select
                value={sortBy}
                onValueChange={(v) => v && setSortBy(v as SortOption)}
              >
                <SelectTrigger className="w-[140px]" aria-label="Sort by">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectPopup>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="createdAt">Date</SelectItem>
                </SelectPopup>
              </Select>
            </div>
          </div>

          {activeFilter === "category" && (
            <Select
              value={categoryFilter}
              onValueChange={(v) => {
                setCategoryFilter(v ?? "");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]" aria-label="Category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="MEN">Men</SelectItem>
                <SelectItem value="WOMEN">Women</SelectItem>
                <SelectItem value="KIDS">Kids</SelectItem>
              </SelectPopup>
            </Select>
          )}

          {activeFilter === "status" && (
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter((v as StatusFilter) ?? "all");
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]" aria-label="Status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectPopup>
            </Select>
          )}

          {activeFilter === "priceRange" && (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min ₹"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-[100px]"
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="number"
                placeholder="Max ₹"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-[100px]"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setPriceMin("");
                  setPriceMax("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            </div>
          )}

          {activeFilter === "dateRange" && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className="text-muted-foreground">-</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDateFrom("");
                  setDateTo("");
                  setPage(1);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardPanel>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="size-8 text-destructive mb-2" />
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground mb-3">No products found</p>
            <Link href="/admin/product/create">
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                Add Your First Product
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div data-slot="frame" className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={
                          products.length > 0 &&
                          selectedIds.size === products.length
                        }
                        onCheckedChange={(checked) =>
                          toggleSelectAll(Boolean(checked))
                        }
                      />
                    </TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const img = getProductImage(product);
                    return (
                      <TableRow key={product._id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(product._id)}
                            onCheckedChange={(checked) =>
                              toggleSelect(product._id, Boolean(checked))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                              {img ? (
                                <Image
                                  src={img}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center">
                                  <Package className="size-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                ID: {product.sku}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>₹{product.price}</TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {product.category} / {product.subCategory}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(product.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={product.isActive ? "success" : "warning"}
                          >
                            {product.isActive ? "Live" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                aria-label="Actions"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/admin/product/${product._id}/edit`,
                                  )
                                }
                              >
                                <Pencil className="size-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                onClick={() => openDeleteDialog(product)}
                              >
                                <Trash2 className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <span>
                Showing {startItem}-{endItem} of {total} products
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardPanel>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setProductToDelete(null);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{productToDelete?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </AlertDialogClose>
              <Button
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deletingId !== null}
              >
                {deletingId ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </AlertDialogFooter>
          </AlertDialogPopup>
        </AlertDialogPortal>
      </AlertDialog>
    </Card>
  );
}
