"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogPortal,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { generateInvoicePdf, type InvoiceOrder } from "@/lib/invoice";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  FileDown,
  Loader2,
  PackageCheck,
  RefreshCw,
  Trash2,
} from "lucide-react";

type OrderTimelineStatus =
  | "Order"
  | "Shipped"
  | "Out of Delivery"
  | "Delivered"
  | "Cancelled";

type StatusFilter = "all" | OrderTimelineStatus;

interface AdminStatusEntry {
  _id?: string;
  status: OrderTimelineStatus;
  description: string;
  createdAt?: string;
}

type AdminOrder = InvoiceOrder & {
  statusHistory?: AdminStatusEntry[];
};

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

const statusOptions: OrderTimelineStatus[] = [
  "Order",
  "Shipped",
  "Out of Delivery",
  "Delivered",
  "Cancelled",
];

const statusDescriptions: Record<OrderTimelineStatus, string> = {
  Order: "Order placed and payment received successfully",
  Shipped: "Your order has been shipped and is on its way",
  "Out of Delivery": "Your order is out for delivery",
  Delivered: "Your order has been delivered successfully",
  Cancelled: "Your order has been cancelled",
};

function resolveLatestStatus(order: AdminOrder): OrderTimelineStatus {
  const candidate = (order.latestStatus ?? "Order") as OrderTimelineStatus;
  return statusOptions.includes(candidate) ? candidate : "Order";
}

function resolveLatestStatusEntry(order: AdminOrder) {
  if (!order.statusHistory || order.statusHistory.length === 0) return null;
  return order.statusHistory[order.statusHistory.length - 1] ?? null;
}

function formatDate(value?: string) {
  if (!value) return "-";

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
  const [printingOrderId, setPrintingOrderId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<AdminOrder | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [orderToManage, setOrderToManage] = useState<AdminOrder | null>(null);
  const [editingStatus, setEditingStatus] =
    useState<OrderTimelineStatus>("Order");
  const [editingDescription, setEditingDescription] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);

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

  const handlePrintInvoice = useCallback(async (order: AdminOrder) => {
    setPrintingOrderId(order._id);

    try {
      await generateInvoicePdf(order);
    } catch (printError) {
      console.error("Error generating invoice PDF:", printError);
    } finally {
      setPrintingOrderId(null);
    }
  }, []);

  const openDeleteDialog = (order: AdminOrder) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const openStatusDialog = (order: AdminOrder) => {
    const latestStatusEntry = resolveLatestStatusEntry(order);
    const latestStatus = resolveLatestStatus(order);

    setOrderToManage(order);
    setEditingStatus(latestStatus);
    setEditingDescription(
      latestStatusEntry?.description || statusDescriptions[latestStatus],
    );
    setStatusDialogOpen(true);
  };

  const closeStatusDialog = () => {
    setStatusDialogOpen(false);
    setOrderToManage(null);
    setEditingStatus("Order");
    setEditingDescription("");
  };

  const handleSaveStatus = useCallback(async () => {
    if (!orderToManage) return;

    setSavingStatus(true);

    try {
      const response = await api.patch(
        `/order/admin/update-status/${orderToManage._id}`,
        {
          status: editingStatus,
          description: editingDescription.trim(),
        },
      );

      if (response?.status) {
        closeStatusDialog();
        await fetchOrders();
      } else {
        setError(response?.message || "Failed to update order status");
      }
    } catch (statusError) {
      console.error("Error updating order status:", statusError);
      setError("Failed to update order status");
    } finally {
      setSavingStatus(false);
    }
  }, [editingDescription, editingStatus, fetchOrders, orderToManage]);

  const handleDeleteOrder = useCallback(async () => {
    if (!orderToDelete) return;

    setDeletingOrderId(orderToDelete._id);

    try {
      const response = await api.delete(
        `/order/admin/delete/${orderToDelete._id}`,
      );

      if (response?.status) {
        closeDeleteDialog();
        await fetchOrders();
      } else {
        setError(response?.message || "Failed to delete order");
      }
    } catch (deleteError) {
      console.error("Error deleting order:", deleteError);
      setError("Failed to delete order");
    } finally {
      setDeletingOrderId(null);
    }
  }, [fetchOrders, orderToDelete]);

  return (
    <Card className="mx-auto w-full rounded-2xl shadow-sm">
      <CardHeader className="space-y-4 px-5 pt-5 sm:px-6 sm:pt-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
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
              <RefreshCw className="mr-1.5 size-4" />
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
            <AlertCircle className="mb-2 size-8 text-destructive" />
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
            <PackageCheck className="mb-3 size-12 text-muted-foreground/30" />
            <p className="text-muted-foreground">
              No orders found for the selected filter.
            </p>
          </div>
        ) : (
          <>
            <div
              data-slot="frame"
              className="overflow-x-auto rounded-xl border"
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
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Delete</TableHead>
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
                              {order.notes?.products?.[0]?.name ||
                                order.productId?.name ||
                                "Product"}
                            </p>
                            <p className="mb-0.5 text-xs text-muted-foreground">
                              SKU: {order.productId?.sku || "-"}
                            </p>
                            {(order.notes?.products?.[0]?.color ||
                              order.notes?.products?.[0]?.size) && (
                              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                {order.notes.products[0].color && (
                                  <span>
                                    C: {order.notes.products[0].color}
                                  </span>
                                )}
                                {order.notes.products[0].size && (
                                  <span>S: {order.notes.products[0].size}</span>
                                )}
                                {order.notes.products[0].quantity && (
                                  <span>
                                    Qty: {order.notes.products[0].quantity}
                                  </span>
                                )}
                              </p>
                            )}
                            {order.notes?.products &&
                              order.notes.products.length > 1 && (
                                <p className="mt-1 text-[10px] font-medium text-primary">
                                  +{order.notes.products.length - 1} more
                                  item(s)
                                </p>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="min-w-45 text-muted-foreground">
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
                          <div className="flex flex-col gap-2">
                            <Badge variant={statusBadgeVariant[deliveryStatus]}>
                              {deliveryStatus}
                            </Badge>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => openStatusDialog(order)}
                              className="w-fit whitespace-nowrap"
                            >
                              View / Edit
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintInvoice(order)}
                            disabled={printingOrderId === order._id}
                            className="whitespace-nowrap"
                          >
                            {printingOrderId === order._id ? (
                              <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Preparing...
                              </>
                            ) : (
                              <>
                                <FileDown className="mr-2 size-4" />
                                Print Bill
                              </>
                            )}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => openDeleteDialog(order)}
                            disabled={deletingOrderId === order._id}
                            className="whitespace-nowrap"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </Button>
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

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={(open: boolean) => {
          setDeleteDialogOpen(open);
          if (!open) setOrderToDelete(null);
        }}
      >
        <AlertDialogPortal>
          <AlertDialogBackdrop />
          <AlertDialogPopup>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete order{" "}
                <strong>{orderToDelete?.receipt || orderToDelete?._id}</strong>?
                This removes the order and its status history permanently.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogClose
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Cancel
              </AlertDialogClose>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteOrder}
                disabled={deletingOrderId !== null}
              >
                {deletingOrderId ? (
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

      <Dialog
        open={statusDialogOpen}
        onOpenChange={(open: boolean) => {
          setStatusDialogOpen(open);
          if (!open) {
            setOrderToManage(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Order Status</DialogTitle>
            <DialogDescription>
              Update the current status and review the full status timeline for
              this order.
            </DialogDescription>
          </DialogHeader>
          <DialogPanel className="space-y-5">
            <div className="grid gap-3 rounded-xl border bg-muted/30 p-4 text-sm">
              {(() => {
                const currentStatus = orderToManage
                  ? resolveLatestStatus(orderToManage)
                  : "Order";

                return (
                  <>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Receipt</span>
                      <span className="font-mono text-xs">
                        {orderToManage?.receipt || orderToManage?._id || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">Customer</span>
                      <span className="font-medium">
                        {orderToManage?.userId?.name || "Unknown user"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {orderToManage?.userId?.email || "-"}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-muted-foreground">
                        Current status
                      </span>
                      <Badge
                        variant={statusBadgeVariant[currentStatus]}
                        className="w-fit"
                      >
                        {currentStatus}
                      </Badge>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className="text-sm font-medium">Status</p>
                <Select
                  value={editingStatus}
                  onValueChange={(value) =>
                    setEditingStatus((value as OrderTimelineStatus) ?? "Order")
                  }
                >
                  <SelectTrigger className="w-full" aria-label="Edit status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectPopup>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectPopup>
                </Select>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Description</p>
                <Textarea
                  value={editingDescription}
                  onChange={(event) =>
                    setEditingDescription(event.target.value)
                  }
                  placeholder="Add a short status note"
                  className="min-h-24"
                />
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium">Status timeline</p>
              <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border p-4">
                {(orderToManage?.statusHistory || []).length > 0 ? (
                  orderToManage?.statusHistory?.map((entry, index) => (
                    <div
                      key={
                        entry._id ||
                        `${entry.status}-${entry.createdAt || index}`
                      }
                      className="rounded-lg border bg-background p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge variant={statusBadgeVariant[entry.status]}>
                          {entry.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {entry.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No status updates yet.
                  </p>
                )}
              </div>
            </div>
          </DialogPanel>
          <DialogFooter>
            <Button variant="outline" onClick={closeStatusDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveStatus}
              disabled={savingStatus}
            >
              {savingStatus ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
