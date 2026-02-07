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
import { api } from "@/lib/api";
import {
  Loader2,
  Ticket,
  Trash2,
  Calendar,
  Percent,
  Tag,
  AlertCircle,
  Plus,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  minOrderValue: number;
  usageLimit: number;
  validFrom: string;
  validTill: string;
  isActive: boolean;
  applicableTo: string[];
}

export default function CouponListCard() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<Coupon | null>(null);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get("/admin/coupons/list");

      if (response?.status && response.data?.coupons) {
        setCoupons(response.data.coupons);
      } else {
        setError(response?.message || "Failed to load coupons");
      }
    } catch (err) {
      console.error("Error fetching coupons:", err);
      setError("Failed to load coupons");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openDeleteDialog = (coupon: Coupon) => {
    setCouponToDelete(coupon);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCouponToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!couponToDelete) return;

    const couponId = couponToDelete._id;
    setDeletingId(couponId);

    try {
      const response = await api.delete(`/admin/coupon/delete/${couponId}`);

      if (response?.status) {
        setCoupons((prev) => prev.filter((c) => c._id !== couponId));
        closeDeleteDialog();
      } else {
        alert(response?.message || "Failed to delete coupon");
      }
    } catch (err) {
      console.error("Error deleting coupon:", err);
      alert("Failed to delete coupon");
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

  const isExpired = (validTill: string) => {
    return new Date(validTill) < new Date();
  };

  const isUpcoming = (validFrom: string) => {
    return new Date(validFrom) > new Date();
  };

  return (
    <Card className="mx-5 sm:mx-auto sm:max-w-4xl shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="size-6" />
              Coupons
            </CardTitle>
            <CardDescription>Manage your discount coupons</CardDescription>
          </div>
          <Link href="/admin/coupon/create">
            <Button size="sm">
              <Plus className="size-4 mr-1.5" />
              Create Coupon
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardPanel>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="size-8 text-destructive mb-2" />
            <p className="text-destructive">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCoupons}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        ) : coupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Ticket className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground mb-3">No coupons found</p>
            <Link href="/admin/coupon/create">
              <Button size="sm">
                <Plus className="size-4 mr-1.5" />
                Create Your First Coupon
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.validTill);
              const upcoming = isUpcoming(coupon.validFrom);

              return (
                <div
                  key={coupon._id}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors",
                    expired && "opacity-50",
                  )}
                >
                  {/* Coupon Icon */}
                  <div
                    className={cn(
                      "flex items-center justify-center size-12 rounded-lg",
                      coupon.isActive && !expired
                        ? "bg-green-500/10 text-green-600"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Tag className="size-5" />
                  </div>

                  {/* Coupon Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-lg tracking-wide">
                        {coupon.code}
                      </p>
                      {expired && (
                        <span className="px-1.5 py-0.5 text-xs bg-destructive/10 text-destructive rounded">
                          Expired
                        </span>
                      )}
                      {upcoming && !expired && (
                        <span className="px-1.5 py-0.5 text-xs bg-yellow-500/10 text-yellow-600 rounded">
                          Upcoming
                        </span>
                      )}
                      {!coupon.isActive && !expired && (
                        <span className="px-1.5 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Percent className="size-3" />
                        {coupon.discount}% off
                      </span>
                      <span>Min ₹{coupon.minOrderValue}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(coupon.validFrom)} -{" "}
                        {formatDate(coupon.validTill)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Link href={`/admin/coupon/${coupon._id}/edit`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Edit coupon"
                      >
                        <Pencil className="size-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openDeleteDialog(coupon)}
                      disabled={deletingId === coupon._id}
                      aria-label="Delete coupon"
                    >
                      {deletingId === coupon._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardPanel>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setCouponToDelete(null);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Coupon</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the coupon{" "}
                <strong>{couponToDelete?.code}</strong>? This action cannot be
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
