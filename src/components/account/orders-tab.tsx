"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Package, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

type PaymentStatus = "Paid" | "Pending" | "Failed" | "Refunded";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  date: string;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentMethod: string;
  address: string;
  items: OrderItem[];
}

const sampleOrders: Order[] = [
  {
    id: "ORD-2025-001",
    date: "2025-01-15",
    totalAmount: 4897,
    paymentStatus: "Paid",
    orderStatus: "Delivered",
    paymentMethod: "UPI",
    address: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001",
    items: [
      { name: "Wireless Bluetooth Headphones", quantity: 1, price: 2499 },
      { name: "Phone Case", quantity: 2, price: 599 },
      { name: "USB-C Cable", quantity: 1, price: 199 },
    ],
  },
  {
    id: "ORD-2025-002",
    date: "2025-01-28",
    totalAmount: 1799,
    paymentStatus: "Paid",
    orderStatus: "Shipped",
    paymentMethod: "Credit Card",
    address: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001",
    items: [{ name: "Organic Cotton T-Shirt", quantity: 2, price: 899 }],
  },
  {
    id: "ORD-2025-003",
    date: "2025-02-05",
    totalAmount: 3299,
    paymentStatus: "Pending",
    orderStatus: "Placed",
    paymentMethod: "COD",
    address: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001",
    items: [{ name: "Running Shoes", quantity: 1, price: 3299 }],
  },
  {
    id: "ORD-2025-004",
    date: "2024-12-20",
    totalAmount: 999,
    paymentStatus: "Refunded",
    orderStatus: "Cancelled",
    paymentMethod: "Debit Card",
    address: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001",
    items: [{ name: "Desk Lamp", quantity: 1, price: 999 }],
  },
  {
    id: "ORD-2025-005",
    date: "2025-02-08",
    totalAmount: 5498,
    paymentStatus: "Paid",
    orderStatus: "Out for Delivery",
    paymentMethod: "UPI",
    address: "123 Main Street, Apt 4B, Mumbai, Maharashtra, 400001",
    items: [
      { name: "Backpack", quantity: 1, price: 1999 },
      { name: "Stainless Steel Water Bottle", quantity: 1, price: 599 },
      { name: "Notebook Set", quantity: 2, price: 1450 },
    ],
  },
];

const statusColors: Record<OrderStatus, string> = {
  Placed: "bg-blue-50 text-blue-700 border-blue-200",
  Confirmed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Shipped: "bg-amber-50 text-amber-700 border-amber-200",
  "Out for Delivery": "bg-orange-50 text-orange-700 border-orange-200",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
};

const paymentColors: Record<PaymentStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Failed: "bg-red-50 text-red-700 border-red-200",
  Refunded: "bg-slate-50 text-slate-700 border-slate-200",
};

export function OrdersTab() {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredOrders =
    statusFilter === "all"
      ? sampleOrders
      : sampleOrders.filter((o) => o.orderStatus === statusFilter);

  const toggleOrder = (id: string) => {
    setExpandedOrder((prev) => (prev === id ? null : id));
  };

  if (sampleOrders.length === 0) {
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
            {sampleOrders.length} total orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val ?? "all")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="Placed">Placed</SelectItem>
              <SelectItem value="Confirmed">Confirmed</SelectItem>
              <SelectItem value="Shipped">Shipped</SelectItem>
              <SelectItem value="Out for Delivery">Out for Delivery</SelectItem>
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
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-10">
                  <span className="sr-only">Details</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <>
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => toggleOrder(order.id)}
                  >
                    <TableCell className="font-medium text-foreground">
                      {order.id}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      {"Rs."} {order.totalAmount.toLocaleString("en-IN")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${paymentColors[order.paymentStatus]}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus]}`}
                      >
                        {order.orderStatus}
                      </span>
                    </TableCell>
                    <TableCell>
                      {expandedOrder === order.id ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </TableCell>
                  </TableRow>

                  {expandedOrder === order.id && (
                    <TableRow key={`${order.id}-details`}>
                      <TableCell colSpan={6} className="bg-muted/30 p-0">
                        <OrderDetails order={order} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {filteredOrders.map((order) => (
            <div key={order.id} className="rounded-lg border border-border">
              <button
                type="button"
                className="flex w-full items-center justify-between p-4 text-left"
                onClick={() => toggleOrder(order.id)}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-foreground">
                    {order.id}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {"Rs."} {order.totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusColors[order.orderStatus]}`}
                  >
                    {order.orderStatus}
                  </span>
                  {expandedOrder === order.id ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedOrder === order.id && (
                <div className="border-t border-border">
                  <OrderDetails order={order} />
                </div>
              )}
            </div>
          ))}
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

function OrderDetails({ order }: { order: Order }) {
  return (
    <div className="p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="mb-2 text-sm font-semibold text-foreground">
            Items Ordered
          </h4>
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div
                key={`${order.id}-item-${i}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium text-foreground">
                  {"Rs."} {(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <h4 className="mb-1 text-sm font-semibold text-foreground">
              Payment Method
            </h4>
            <p className="text-sm text-muted-foreground">
              {order.paymentMethod}
            </p>
          </div>
          <div>
            <h4 className="mb-1 text-sm font-semibold text-foreground">
              Delivery Address
            </h4>
            <p className="text-sm text-muted-foreground">{order.address}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
