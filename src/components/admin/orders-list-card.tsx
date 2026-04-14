"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { AlertCircle, Loader2, PackageCheck, RefreshCw } from "lucide-react";

type OrderTimelineStatus =
  | "Order"
  | "Shipped"
  | "Out of Delivery"
  | "Delivered"
  | "Cancelled";

type StatusFilter = "all" | OrderTimelineStatus;

interface AdminOrder {
  _id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  createdAt: string;
  latestStatus?: string;
  userId?: {
    name?: string;
    email?: string;
  };
  productId?: {
    name?: string;
    sku?: string;
  };
  notes?: {
    products?: Array<{
      name?: string;
      color?: string;
      size?: string;
      quantity?: number;
      price?: number;
    }>;
    address?: {
      city?: string;
      state?: string;
      pinCode?: number;
    };
  };
}

interface AdminOrdersResponse {
  status: boolean;
  message: string;
  data: {
    orders: AdminOrder[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  } | null;
}

const statusBadgeVariant: Record<
  OrderTimelineStatus,
  "default" | "info" | "warning" | "success" | "destructive"
> = {
  Order: "info",
  Shipped: "warning",
  "Out of Delivery": "warning",
  Delivered: "success",
  Cancelled: "destructive",
};

function resolveLatestStatus(order: AdminOrder): OrderTimelineStatus {
  const candidate = (order.latestStatus ?? "Order") as OrderTimelineStatus;
  const allowed: OrderTimelineStatus[] = [
    "Order",
    "Shipped",
    "Out of Delivery",
    "Delivered",
    "Cancelled",
  ];
  return allowed.includes(candidate) ? candidate : "Order";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAddress(order: AdminOrder) {
  const city = order.notes?.address?.city;
  const state = order.notes?.address?.state;
  const pinCode = order.notes?.address?.pinCode;
  const text = [city, state, pinCode].filter(Boolean).join(", ");
  return text || "-";
}

export default function OrdersListCard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<AdminOrdersResponse>(
        `/order/admin/all?page=${page}&limit=${limit}`,
      );

      if (response?.status && response.data) {
        setOrders(response.data.orders ?? []);
        setTotal(response.data.pagination?.total ?? 0);
        setTotalPages(response.data.pagination?.totalPages ?? 1);
      } else {
        setOrders([]);
        setError(response?.message || "Failed to load orders");
      }
    } catch (fetchError) {
      console.error("Error fetching admin orders:", fetchError);
      setOrders([]);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter(
      (order) => resolveLatestStatus(order) === statusFilter,
    );
  }, [orders, statusFilter]);

  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <Card className="mx-auto w-full rounded-2xl shadow-sm">
      <CardHeader className="space-y-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <PackageCheck className="size-6" />
              Orders
            </CardTitle>
            <CardDescription>
              All paid orders from the storefront
            </CardDescription>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter((value as StatusFilter | null) ?? "all")
              }
            >
              <SelectTrigger
                className="w-full sm:w-42.5"
                aria-label="Filter orders"
              >
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectPopup>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="Order">Order</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Out of Delivery">Out of Delivery</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectPopup>
            </Select>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchOrders}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="size-4 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardPanel className="px-5 pb-5 sm:px-6 sm:pb-6">
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
              onClick={fetchOrders}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PackageCheck className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">
              No orders found for the selected filter.
            </p>
          </div>
        ) : (
          <>
            <div
              data-slot="frame"
              className="rounded-xl border overflow-x-auto"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Delivery</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const deliveryStatus = resolveLatestStatus(order);

                    return (
                      <TableRow key={order._id}>
                        <TableCell className="font-mono text-xs">
                          {order.receipt || "-"}
                        </TableCell>
                        <TableCell>
                          <div className="min-w-45">
                            <p className="font-medium">
                              {order.userId?.name || "Unknown user"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.userId?.email || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-45">
                            <p className="font-medium">
                              {order.notes?.products?.[0]?.name || order.productId?.name || "Product"}
                            </p>
                            <p className="text-xs text-muted-foreground mb-0.5">
                              SKU: {order.productId?.sku || "-"}
                            </p>
                            {(order.notes?.products?.[0]?.color || order.notes?.products?.[0]?.size) && (
                              <p className="text-[11px] text-muted-foreground flex gap-1.5 items-center">
                                {order.notes.products[0].color && <span>C: {order.notes.products[0].color}</span>}
                                {order.notes.products[0].size && <span>S: {order.notes.products[0].size}</span>}
                                {order.notes.products[0].quantity && <span>Qty: {order.notes.products[0].quantity}</span>}
                              </p>
                            )}
                            {order.notes?.products && order.notes.products.length > 1 && (
                                <p className="text-[10px] text-primary font-medium mt-1">
                                    +{order.notes.products.length - 1} more item(s)
                                </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground min-w-45">
                          {formatAddress(order)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.currency || "INR"}{" "}
                          {order.amount.toLocaleString("en-IN")}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{order.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[deliveryStatus]}>
                            {deliveryStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
              <span>
                Showing {startItem}-{endItem} of {total} orders
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardPanel>
    </Card>
  );
}
