"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Filter,
  Loader2,
  ExternalLink,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  Box,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type OrderStatusType =
  | "Order"
  | "Shipped"
  | "Out of Delivery"
  | "Delivered"
  | "Cancelled";

interface StatusEntry {
  _id: string;
  status: OrderStatusType;
  description: string;
  createdAt: string;
}

interface OrderData {
  _id: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  paymentId: string;
  createdAt: string;
  productId: {
    _id: string;
    name: string;
    price: number;
    mrp: number;
    variants: any[];
    sku: string;
  };
  notes: {
    name: string;
    email: string;
    products: any[];
    offer: string;
    address: {
      label: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      pinCode: number;
      phoneNo: number;
    };
  };
  statusHistory: StatusEntry[];
}

const statusConfig: Record<
  OrderStatusType,
  { icon: any; color: string; label: string }
> = {
  Order: {
    icon: Package,
    color: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Order Placed",
  },
  Shipped: {
    icon: Box,
    color: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Shipped",
  },
  "Out of Delivery": {
    icon: Truck,
    color: "bg-orange-50 text-orange-700 border-orange-200",
    label: "Out for Delivery",
  },
  Delivered: {
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Delivered",
  },
  Cancelled: {
    icon: XCircle,
    color: "bg-red-50 text-red-700 border-red-200",
    label: "Cancelled",
  },
};

export function OrdersTab() {
  const router = useRouter();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const {
    data: ordersData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myOrders"],
    queryFn: async () => {
      const res = await api.get("/order/my-orders");
      return res;
    },
    staleTime: 2 * 60 * 1000,
  });

  const orders: OrderData[] = ordersData?.status ? ordersData.data || [] : [];

  const getLatestStatus = (order: OrderData): OrderStatusType => {
    if (!order.statusHistory || order.statusHistory.length === 0) return "Order";
    return order.statusHistory[order.statusHistory.length - 1].status;
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => getLatestStatus(o) === statusFilter);

  const toggleOrder = (id: string) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">
            Loading your orders...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <h3 className="text-base font-medium text-foreground">
            Failed to load orders
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground">
            No orders yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Your order history will appear here once you place an order.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="flex flex-col gap-3 p-6 pb-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Order History
          </h2>
          <p className="text-sm text-muted-foreground">
            {orders.length} total order{orders.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "all")}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="Order">Order Placed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Out of Delivery">Out for Delivery</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="p-6">
        {/* Desktop table */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => {
                const latestStatus = getLatestStatus(order);
                const config = statusConfig[latestStatus];
                const productName =
                  order.notes?.products?.[0]?.name ||
                  order.productId?.name ||
                  "Product";

                return (
                  <>
                    <TableRow
                      key={order._id}
                      className="cursor-pointer"
                      onClick={() => toggleOrder(order._id)}
                    >
                      <TableCell className="font-medium text-foreground font-mono text-xs">
                        {order.receipt}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <p className="text-sm text-foreground truncate">
                          {productName}
                        </p>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        ₹{order.amount?.toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${config.color}`}
                        >
                          {config.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/track?id=${order._id}`);
                            }}
                          >
                            <MapPin className="h-3 w-3" />
                            Track
                          </Button>
                          {expandedOrder === order._id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedOrder === order._id && (
                      <TableRow key={`${order._id}-details`}>
                        <TableCell colSpan={6} className="bg-muted/30 p-0">
                          <OrderDetails order={order} />
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {filteredOrders.map((order) => {
            const latestStatus = getLatestStatus(order);
            const config = statusConfig[latestStatus];
            const productName =
              order.notes?.products?.[0]?.name ||
              order.productId?.name ||
              "Product";

            return (
              <div key={order._id} className="rounded-lg border border-border">
                <button
                  type="button"
                  className="flex w-full items-center justify-between p-4 text-left"
                  onClick={() => toggleOrder(order._id)}
                >
                  <div className="flex flex-col gap-1 flex-1 min-w-0 pr-3">
                    <span className="text-xs text-muted-foreground font-mono">
                      {order.receipt}
                    </span>
                    <span className="text-sm font-semibold text-foreground truncate">
                      {productName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      <span className="mx-1.5">·</span>₹
                      {order.amount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${config.color}`}
                    >
                      {config.label}
                    </span>
                    {expandedOrder === order._id ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedOrder === order._id && (
                  <div className="border-t border-border">
                    <OrderDetails order={order} />
                    <div className="px-4 pb-4">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-1.5"
                        onClick={() =>
                          router.push(`/track?id=${order._id}`)
                        }
                      >
                        <MapPin className="h-3.5 w-3.5" />
                        Track Order
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No orders match the selected filter.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-transparent"
              onClick={() => setStatusFilter("all")}
            >
              Clear Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetails({ order }: { order: OrderData }) {
  const address = order.notes?.address;
  const products = order.notes?.products || [];
  const latestStatus =
    order.statusHistory?.[order.statusHistory.length - 1];

  return (
    <div className="p-5">
      <div className="grid gap-5 sm:grid-cols-3">
        {/* Items */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Items Ordered
          </h4>
          <div className="flex flex-col gap-2">
            {products.length > 0
              ? products.map((item: any, i: number) => (
                <div
                  key={`${order._id}-item-${i}`}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate pr-2">
                    {item.name}
                    {item.quantity > 1 && ` x${item.quantity}`}
                  </span>
                  <span className="font-medium text-foreground whitespace-nowrap">
                    ₹{item.price?.toLocaleString("en-IN")}
                  </span>
                </div>
              ))
              : (
                <p className="text-sm text-muted-foreground">
                  {order.productId?.name || "Product"}
                </p>
              )}
          </div>
        </div>

        {/* Address */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Delivery Address
          </h4>
          {address ? (
            <div className="text-sm text-muted-foreground">
              <p>{address.addressLine1}</p>
              {address.addressLine2 && <p>{address.addressLine2}</p>}
              <p>
                {address.city}, {address.state} - {address.pinCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">N/A</p>
          )}
        </div>

        {/* Latest Status */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Latest Update
          </h4>
          {latestStatus ? (
            <div className="flex items-start gap-2">
              <div
                className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${statusConfig[latestStatus.status]
                    ? "bg-current"
                    : "bg-muted-foreground"
                  }`}
                style={{
                  color:
                    latestStatus.status === "Delivered"
                      ? "#059669"
                      : latestStatus.status === "Cancelled"
                        ? "#dc2626"
                        : "#d97706",
                }}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {statusConfig[latestStatus.status]?.label || latestStatus.status}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {latestStatus.description}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {new Date(latestStatus.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No status updates yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
