"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
    Package,
    Truck,
    MapPin,
    CheckCircle2,
    XCircle,
    Search,
    Loader2,
    Clock,
    ArrowRight,
    Copy,
    Check,
    Box,
    ChevronRight,
    AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// Status configuration with icons, colors, descriptions
const STATUS_CONFIG = {
    Order: {
        icon: Package,
        label: "Order Placed",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        ringColor: "ring-blue-500",
        dotColor: "bg-blue-500",
        gradient: "from-blue-500 to-blue-600",
        description: "Your order has been confirmed",
    },
    Shipped: {
        icon: Box,
        label: "Shipped",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        ringColor: "ring-amber-500",
        dotColor: "bg-amber-500",
        gradient: "from-amber-500 to-amber-600",
        description: "Package is on its way",
    },
    "Out of Delivery": {
        icon: Truck,
        label: "Out for Delivery",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        borderColor: "border-orange-200",
        ringColor: "ring-orange-500",
        dotColor: "bg-orange-500",
        gradient: "from-orange-500 to-orange-600",
        description: "Out for delivery to your address",
    },
    Delivered: {
        icon: CheckCircle2,
        label: "Delivered",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200",
        ringColor: "ring-emerald-500",
        dotColor: "bg-emerald-500",
        gradient: "from-emerald-500 to-emerald-600",
        description: "Successfully delivered",
    },
    Cancelled: {
        icon: XCircle,
        label: "Cancelled",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        ringColor: "ring-red-500",
        dotColor: "bg-red-500",
        gradient: "from-red-500 to-red-600",
        description: "Order has been cancelled",
    },
} as const;

const STATUS_ORDER = [
    "Order",
    "Shipped",
    "Out of Delivery",
    "Delivered",
] as const;

type StatusKey = keyof typeof STATUS_CONFIG;

interface StatusEntry {
    _id: string;
    status: StatusKey;
    description: string;
    createdAt: string;
    updatedAt: string;
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
    updatedAt: string;
    productId: {
        _id: string;
        name: string;
        price: number;
        mrp: number;
        variants: any[];
        category: string;
        subCategory: string;
        sku: string;
    };
    notes: {
        name: string;
        email: string;
        products: any[];
        offer: string;
        address: {
            _id: string;
            label: string;
            addressLine1: string;
            addressLine2: string;
            addressLine3: string;
            city: string;
            state: string;
            pinCode: number;
            phoneNo: number;
        };
    };
    statusHistory: StatusEntry[];
}

export function OrderTracking() {
    const searchParams = useSearchParams();
    const orderIdFromUrl = searchParams.get("id") || "";
    const [searchId, setSearchId] = useState(orderIdFromUrl);
    const [activeOrderId, setActiveOrderId] = useState(orderIdFromUrl);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Fetch all user orders
    const {
        data: ordersData,
        isLoading: ordersLoading,
        isError: ordersError,
    } = useQuery({
        queryKey: ["myOrders"],
        queryFn: async () => {
            const res = await api.get("/order/my-orders");
            return res;
        },
        staleTime: 2 * 60 * 1000,
    });

    // Fetch specific order when an ID is selected / searched
    const {
        data: trackedOrder,
        isLoading: trackLoading,
        isError: trackError,
        refetch: trackRefetch,
    } = useQuery({
        queryKey: ["trackOrder", activeOrderId],
        queryFn: async () => {
            const res = await api.get(`/order/track/${activeOrderId}`);
            return res;
        },
        enabled: !!activeOrderId,
        staleTime: 30 * 1000,
    });

    // Auto-select first order if none selected
    useEffect(() => {
        if (
            !activeOrderId &&
            ordersData?.status &&
            ordersData.data?.length > 0
        ) {
            const firstId = ordersData.data[0]._id;
            setActiveOrderId(firstId);
            setSearchId(firstId);
        }
    }, [ordersData, activeOrderId]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchId.trim()) {
            setActiveOrderId(searchId.trim());
        }
    };

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const orders: OrderData[] = ordersData?.status ? ordersData.data || [] : [];
    const tracked: OrderData | null =
        trackedOrder?.status ? trackedOrder.data : null;

    const getLatestStatus = (order: OrderData): StatusKey => {
        if (!order.statusHistory || order.statusHistory.length === 0) return "Order";
        return order.statusHistory[order.statusHistory.length - 1].status;
    };

    const getEstimatedDelivery = (order: OrderData) => {
        const orderDate = new Date(order.createdAt);
        const estimatedDate = new Date(orderDate);
        estimatedDate.setDate(estimatedDate.getDate() + 7);
        return estimatedDate.toLocaleDateString("en-IN", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#1f3a56] via-[#2a4a6b] to-[#1a3050]">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-300/10 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl" />
                </div>

                <div className="relative mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-1.5 mb-4">
                            <MapPin className="h-3.5 w-3.5 text-blue-200" />
                            <span className="text-xs font-medium text-blue-100 tracking-wide uppercase">
                                Live Order Tracking
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                            Track Your Order
                        </h1>
                        <p className="mt-2 text-sm text-blue-200/80 max-w-md mx-auto">
                            Enter your Order ID to get real-time updates on your shipment
                        </p>
                    </div>

                    {/* Search Box */}
                    <form
                        onSubmit={handleSearch}
                        className="mx-auto max-w-xl"
                    >
                        <div className="relative flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur-sm p-1.5 shadow-xl shadow-black/10 ring-1 ring-white/20">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                                <Input
                                    type="text"
                                    placeholder="Enter Order ID or Receipt ID..."
                                    value={searchId}
                                    onChange={(e) => setSearchId(e.target.value)}
                                    className="border-0 bg-transparent pl-10 pr-4 py-2.5 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                                />
                            </div>
                            <Button
                                type="submit"
                                size="sm"
                                className="bg-[#1f3a56] hover:bg-[#2a4a6b] text-white px-6 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all duration-200"
                            >
                                Track
                                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
                {/* Loading state */}
                {(ordersLoading || trackLoading) && !tracked && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                            <Loader2 className="h-8 w-8 animate-spin text-primary relative" />
                        </div>
                        <p className="mt-4 text-sm text-muted-foreground animate-pulse">
                            Fetching your order details...
                        </p>
                    </div>
                )}

                {/* Error state */}
                {(ordersError || (trackError && activeOrderId)) && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                            <AlertCircle className="h-6 w-6 text-red-500" />
                        </div>
                        <h3 className="text-base font-medium text-foreground">
                            Unable to load order
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground text-center max-w-sm">
                            We couldn&apos;t find the order. Please check the Order ID and try
                            again.
                        </p>
                    </div>
                )}

                {/* No orders */}
                {!ordersLoading && !ordersError && orders.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Package className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">
                            No orders yet
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Your order tracking will appear here once you place an order.
                        </p>
                    </div>
                )}

                {/* Main content: Order list + tracked order detail */}
                {orders.length > 0 && (
                    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
                        {/* Left: Order List */}
                        <div className="lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto lg:pr-2 scrollbar-thin">
                            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                <Package className="h-4 w-4" />
                                Your Orders
                                <Badge variant="secondary" className="ml-auto text-xs">
                                    {orders.length}
                                </Badge>
                            </h2>
                            <div className="flex flex-col gap-2">
                                {orders.map((order) => {
                                    const latestStatus = getLatestStatus(order);
                                    const config = STATUS_CONFIG[latestStatus];
                                    const isActive = activeOrderId === order._id;

                                    return (
                                        <button
                                            key={order._id}
                                            onClick={() => {
                                                setActiveOrderId(order._id);
                                                setSearchId(order._id);
                                            }}
                                            className={`group w-full text-left rounded-xl border p-3.5 transition-all duration-200 ${isActive
                                                    ? "border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/20"
                                                    : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-muted-foreground font-medium mb-0.5">
                                                        {order.receipt}
                                                    </p>
                                                    <p className="text-sm font-semibold text-foreground truncate">
                                                        {order.notes?.products?.[0]?.name ||
                                                            order.productId?.name ||
                                                            "Product"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(order.createdAt).toLocaleDateString(
                                                            "en-IN",
                                                            {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            },
                                                        )}
                                                        <span className="mx-1.5">·</span>
                                                        ₹{order.amount?.toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-1.5">
                                                    <span
                                                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.bgColor} ${config.color} ${config.borderColor}`}
                                                    >
                                                        {config.label}
                                                    </span>
                                                    <ChevronRight
                                                        className={`h-3.5 w-3.5 transition-colors ${isActive
                                                                ? "text-primary"
                                                                : "text-muted-foreground/40 group-hover:text-muted-foreground"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right: Order Tracking Detail */}
                        <div className="flex-1">
                            {trackLoading && activeOrderId && (
                                <div className="flex items-center justify-center py-20 rounded-xl border border-border bg-card">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="ml-3 text-sm text-muted-foreground">
                                        Loading tracking details...
                                    </span>
                                </div>
                            )}

                            {tracked && <TrackingDetail order={tracked} onCopy={handleCopy} copiedField={copiedField} getEstimatedDelivery={getEstimatedDelivery} />}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}

/* ─── Tracking Detail Card ─── */
function TrackingDetail({
    order,
    onCopy,
    copiedField,
    getEstimatedDelivery,
}: {
    order: OrderData;
    onCopy: (text: string, field: string) => void;
    copiedField: string | null;
    getEstimatedDelivery: (order: OrderData) => string;
}) {
    const latestStatus =
        order.statusHistory?.[order.statusHistory.length - 1]?.status || "Order";
    const config = STATUS_CONFIG[latestStatus as StatusKey];
    const isCancelled = latestStatus === "Cancelled";
    const isDelivered = latestStatus === "Delivered";
    const StatusIcon = config.icon;

    // Build completed statuses set
    const completedStatuses = new Set(
        order.statusHistory?.map((s) => s.status) || [],
    );

    const productImage =
        order.productId?.variants?.[0]?.images?.[0] || null;
    const productName =
        order.notes?.products?.[0]?.name || order.productId?.name || "Product";
    const productColor = order.notes?.products?.[0]?.color || "";
    const productSize = order.notes?.products?.[0]?.size || "";
    const address = order.notes?.address;

    return (
        <div className="space-y-4">
            {/* Status Hero Card */}
            <div
                className={`relative rounded-2xl border overflow-hidden ${config.borderColor} ${config.bgColor}`}
            >
                {/* Decorative gradient */}
                <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.gradient}`}
                />

                <div className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div
                                className={`h-12 w-12 rounded-xl ${config.bgColor} border ${config.borderColor} flex items-center justify-center shadow-sm`}
                            >
                                <StatusIcon className={`h-6 w-6 ${config.color}`} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                                    Current Status
                                </p>
                                <h2 className={`text-lg font-bold ${config.color}`}>
                                    {config.label}
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {config.description}
                                </p>
                            </div>
                        </div>

                        {!isCancelled && !isDelivered && (
                            <div className="flex flex-col items-start sm:items-end gap-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                    Estimated Delivery
                                </p>
                                <p className="text-sm font-bold text-foreground">
                                    {getEstimatedDelivery(order)}
                                </p>
                            </div>
                        )}

                        {isDelivered && order.statusHistory && (
                            <div className="flex flex-col items-start sm:items-end gap-0.5">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                    Delivered On
                                </p>
                                <p className="text-sm font-bold text-emerald-700">
                                    {new Date(
                                        order.statusHistory[
                                            order.statusHistory.length - 1
                                        ].createdAt,
                                    ).toLocaleDateString("en-IN", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Order Info Cards Row */}
            <div className="grid gap-3 sm:grid-cols-3">
                {/* Order ID */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Order ID
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-medium text-foreground truncate flex-1">
                            {order._id}
                        </p>
                        <button
                            onClick={() => onCopy(order._id, "orderId")}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {copiedField === "orderId" ? (
                                <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                                <Copy className="h-3.5 w-3.5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Payment ID */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Payment ID
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs font-mono font-medium text-foreground truncate flex-1">
                            {order.paymentId || "N/A"}
                        </p>
                        {order.paymentId && (
                            <button
                                onClick={() => onCopy(order.paymentId, "paymentId")}
                                className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                {copiedField === "paymentId" ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Amount */}
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
                        Amount Paid
                    </p>
                    <p className="text-lg font-bold text-foreground">
                        ₹{order.amount?.toLocaleString("en-IN")}
                    </p>
                </div>
            </div>

            {/* Tracking Timeline */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="p-5 sm:p-6 pb-0 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        Tracking Timeline
                    </h3>
                    {order.statusHistory && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                            {order.statusHistory.length} Update
                            {order.statusHistory.length !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>

                <div className="p-5 sm:p-6">
                    {/* Horizontal stepper for desktop */}
                    <div className="hidden sm:block mb-8">
                        <HorizontalStepper
                            statusHistory={order.statusHistory || []}
                            isCancelled={isCancelled}
                        />
                    </div>

                    {/* Vertical timeline (always visible) */}
                    <VerticalTimeline
                        statusHistory={order.statusHistory || []}
                        isCancelled={isCancelled}
                    />
                </div>
            </div>

            {/* Product + Delivery Address */}
            <div className="grid gap-4 sm:grid-cols-2">
                {/* Product Info */}
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Product Details
                    </h4>
                    <div className="flex gap-3.5">
                        {productImage ? (
                            <img
                                src={productImage}
                                alt={productName}
                                className="h-20 w-16 object-cover rounded-lg border border-border"
                            />
                        ) : (
                            <div className="h-20 w-16 rounded-lg border border-border bg-muted flex items-center justify-center">
                                <Package className="h-6 w-6 text-muted-foreground/40" />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground line-clamp-2">
                                {productName}
                            </p>
                            {(productColor || productSize) && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {productColor && <span>Color: {productColor}</span>}
                                    {productColor && productSize && (
                                        <span className="mx-1">·</span>
                                    )}
                                    {productSize && <span>Size: {productSize}</span>}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-0.5">
                                SKU: {order.productId?.sku || "N/A"}
                            </p>
                            {order.notes?.products && order.notes.products.length > 1 && (
                                <p className="text-xs text-primary font-medium mt-1.5">
                                    +{order.notes.products.length - 1} more item
                                    {order.notes.products.length - 1 > 1 ? "s" : ""}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Delivery Address */}
                <div className="rounded-2xl border border-border bg-card p-5">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Delivery Address
                    </h4>
                    {address ? (
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Badge
                                    variant="secondary"
                                    className="text-[10px] uppercase tracking-wider"
                                >
                                    {address.label}
                                </Badge>
                            </div>
                            <p className="text-sm text-foreground leading-relaxed">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                            </p>
                            {address.addressLine3 && (
                                <p className="text-sm text-muted-foreground">
                                    {address.addressLine3}
                                </p>
                            )}
                            <p className="text-sm text-muted-foreground mt-0.5">
                                {address.city}, {address.state} - {address.pinCode}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                                📞 +91 {address.phoneNo}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Address details not available
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ─── Horizontal Stepper (Desktop) ─── */
function HorizontalStepper({
    statusHistory,
    isCancelled,
}: {
    statusHistory: StatusEntry[];
    isCancelled: boolean;
}) {
    const completedStatuses = new Set(statusHistory.map((s) => s.status));
    const steps = isCancelled
        ? [...STATUS_ORDER.slice(0, -1), "Cancelled" as StatusKey]
        : STATUS_ORDER;

    // Determine the index of the last completed step
    let lastCompletedIdx = -1;
    steps.forEach((step, idx) => {
        if (completedStatuses.has(step)) lastCompletedIdx = idx;
    });

    return (
        <div className="relative flex items-center justify-between">
            {steps.map((stepKey, idx) => {
                const config = STATUS_CONFIG[stepKey];
                const Icon = config.icon;
                const isCompleted = completedStatuses.has(stepKey);
                const isCurrent = idx === lastCompletedIdx;
                const isPast = idx < lastCompletedIdx;
                const isLast = idx === steps.length - 1;

                return (
                    <div
                        key={stepKey}
                        className="flex flex-col items-center relative"
                        style={{ flex: isLast ? "0 0 auto" : 1 }}
                    >
                        {/* Connecting line */}
                        {idx < steps.length - 1 && (
                            <div className="absolute top-4 left-1/2 w-full h-0.5 -z-0">
                                <div
                                    className={`h-full transition-all duration-500 ${isPast || (isCompleted && idx < lastCompletedIdx)
                                            ? "bg-emerald-400"
                                            : "bg-border"
                                        }`}
                                />
                            </div>
                        )}

                        {/* Step circle */}
                        <div
                            className={`relative z-10 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent
                                    ? `${config.bgColor} border-2 ${config.borderColor} ring-4 ring-opacity-20 ${config.ringColor}`
                                    : isCompleted
                                        ? `bg-emerald-50 border-2 border-emerald-300`
                                        : "bg-muted border-2 border-border"
                                }`}
                        >
                            {isCompleted && !isCurrent ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                                <Icon
                                    className={`h-3.5 w-3.5 ${isCurrent || isCompleted
                                            ? config.color
                                            : "text-muted-foreground/40"
                                        }`}
                                />
                            )}
                            {/* Pulse for current */}
                            {isCurrent && (
                                <span
                                    className={`absolute inset-0 rounded-full animate-ping opacity-20 ${config.dotColor}`}
                                />
                            )}
                        </div>

                        {/* Label */}
                        <p
                            className={`mt-2 text-[11px] font-medium text-center ${isCurrent
                                    ? config.color
                                    : isCompleted
                                        ? "text-emerald-600"
                                        : "text-muted-foreground/50"
                                }`}
                        >
                            {config.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}

/* ─── Vertical Timeline ─── */
function VerticalTimeline({
    statusHistory,
    isCancelled,
}: {
    statusHistory: StatusEntry[];
    isCancelled: boolean;
}) {
    // Show in reverse chronological order (newest first)
    const sorted = [...statusHistory].reverse();

    if (sorted.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">
                    No tracking updates available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {sorted.map((entry, idx) => {
                const config =
                    STATUS_CONFIG[entry.status as StatusKey] || STATUS_CONFIG["Order"];
                const Icon = config.icon;
                const isLatest = idx === 0;
                const isLast = idx === sorted.length - 1;

                const date = new Date(entry.createdAt);
                const formattedDate = date.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                });
                const formattedTime = date.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                });

                return (
                    <div key={entry._id} className="relative flex gap-4 pb-6 last:pb-0">
                        {/* Vertical line */}
                        {!isLast && (
                            <div className="absolute left-[15px] top-8 bottom-0 w-[2px] bg-border" />
                        )}

                        {/* Timeline dot */}
                        <div className="relative z-10 shrink-0">
                            <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all ${isLatest
                                        ? `${config.bgColor} ${config.borderColor} shadow-sm`
                                        : "bg-card border-border"
                                    }`}
                            >
                                <Icon
                                    className={`h-3.5 w-3.5 ${isLatest ? config.color : "text-muted-foreground/50"
                                        }`}
                                />
                            </div>
                            {isLatest && (
                                <span
                                    className={`absolute inset-0 rounded-full animate-ping opacity-20 ${config.dotColor}`}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <div>
                                    <h4
                                        className={`text-sm font-semibold ${isLatest ? config.color : "text-foreground"
                                            }`}
                                    >
                                        {config.label}
                                        {isLatest && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                                                Latest
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {entry.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                    <Clock className="h-3 w-3" />
                                    {formattedDate}, {formattedTime}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
