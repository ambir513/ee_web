"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  Loader2,
  Package,
  RefreshCw,
  ShoppingBag,
  TicketPercent,
  Truck,
  Users,
  CheckCircle2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DeliveryStatus =
  | "Order"
  | "Shipped"
  | "Out of Delivery"
  | "Delivered"
  | "Cancelled";

interface DashboardResponse {
  status: boolean;
  message: string;
  data: {
    overview: {
      totalOrders: number;
      totalRevenue: number;
      averageOrderValue: number;
      totalCustomers: number;
      totalUsers: number;
      newUsers30d: number;
      totalProducts: number;
      activeProducts: number;
      totalCategories: number;
      totalCoupons: number;
      activeCoupons: number;
    };
    revenueTrend: Array<{
      label: string;
      revenue: number;
      orders: number;
    }>;
    deliveryBreakdown: Array<{
      status: DeliveryStatus;
      count: number;
    }>;
    categoryBreakdown: Array<{
      category: string;
      total: number;
      active: number;
    }>;
    topProducts: Array<{
      id: string;
      name: string;
      sku: string;
      category: string;
      orders: number;
      revenue: number;
    }>;
    recentOrders: Array<{
      id: string;
      receipt: string;
      amount: number;
      currency: string;
      createdAt?: string;
      latestStatus: DeliveryStatus;
      user: {
        name?: string;
        email?: string;
      };
      product: {
        name?: string;
        sku?: string;
      };
    }>;
  } | null;
}

const metricCards = [
  { key: "totalRevenue", label: "Revenue", icon: CircleDollarSign },
  { key: "totalOrders", label: "Paid Orders", icon: ShoppingBag },
  { key: "totalCustomers", label: "Customers", icon: Users },
  { key: "totalProducts", label: "Products", icon: Package },
  { key: "totalCoupons", label: "Coupons", icon: TicketPercent },
  { key: "newUsers30d", label: "New Users", icon: ArrowUpRight },
] as const;

const deliveryBadgeVariant: Record<
  DeliveryStatus,
  "default" | "info" | "warning" | "success" | "destructive"
> = {
  Order: "info",
  Shipped: "warning",
  "Out of Delivery": "warning",
  Delivered: "success",
  Cancelled: "destructive",
};

const chartPalette = [
  "#d97706",
  "#ea580c",
  "#7c2d12",
  "#10b981",
  "#0f766e",
  "#2563eb",
];

function formatCurrency(amount: number, currency = "INR") {
  return `${currency} ${amount.toLocaleString("en-IN")}`;
}

function formatTrendLabel(label: string) {
  const [year, month] = label.split("-").map(Number);
  if (!year || !month) return label;

  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}

function formatDate(value?: string) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortCurrency(amount: number) {
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`;
  return `${amount}`;
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden border-stone-200/80 bg-white/90 shadow-sm backdrop-blur">
      <CardPanel className="flex items-center gap-4 p-5">
        <div
          className={cn(
            "grid size-12 place-items-center rounded-2xl text-white shadow-lg",
            accent,
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-2xl font-semibold text-stone-900">
            {value}
          </p>
        </div>
      </CardPanel>
    </Card>
  );
}

function EmptyStateCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-stone-200 bg-stone-50/80 px-6 text-center">
      <Icon className="size-10 text-stone-400" />
      <p className="mt-3 font-medium text-stone-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

export default function AdminDashboardCard() {
  const [data, setData] = useState<DashboardResponse["data"]>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<DashboardResponse>(
        "/admin/dashboard/summary",
      );

      if (response?.status && response.data) {
        setData(response.data);
        setLastUpdated(new Date());
      } else {
        setData(null);
        setError(response?.message || "Failed to load dashboard");
      }
    } catch (fetchError) {
      console.error("Error loading admin dashboard:", fetchError);
      setData(null);
      setError("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const overview = data?.overview;
  const revenueTrend = data?.revenueTrend ?? [];
  const deliveryBreakdown = data?.deliveryBreakdown ?? [];
  const categoryBreakdown = data?.categoryBreakdown ?? [];
  const topProducts = data?.topProducts ?? [];
  const recentOrders = data?.recentOrders ?? [];

  const maxRevenue = useMemo(
    () => Math.max(...revenueTrend.map((item) => item.revenue), 0),
    [revenueTrend],
  );
  const maxDelivery = useMemo(
    () => Math.max(...deliveryBreakdown.map((item) => item.count), 0),
    [deliveryBreakdown],
  );
  const maxCategory = useMemo(
    () => Math.max(...categoryBreakdown.map((item) => item.total), 0),
    [categoryBreakdown],
  );
  const maxTopProductOrders = useMemo(
    () => Math.max(...topProducts.map((item) => item.orders), 1),
    [topProducts],
  );

  const revenueChartData = useMemo(
    () =>
      revenueTrend.map((item) => ({
        month: formatTrendLabel(item.label),
        revenue: item.revenue,
        orders: item.orders,
      })),
    [revenueTrend],
  );
  const categoryChartData = useMemo(
    () =>
      categoryBreakdown.map((item) => ({
        name: item.category,
        value: item.total,
      })),
    [categoryBreakdown],
  );
  const deliveryChartData = useMemo(
    () =>
      deliveryBreakdown.map((item) => ({
        status: item.status,
        count: item.count,
      })),
    [deliveryBreakdown],
  );

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "#d97706",
    },
    orders: {
      label: "Orders",
      color: "#7c2d12",
    },
  };

  const categoryChartConfig = Object.fromEntries(
    categoryChartData.map((item, index) => [
      item.name,
      {
        label: item.name,
        color: chartPalette[index % chartPalette.length],
      },
    ]),
  );

  const deliveryChartConfig = Object.fromEntries(
    deliveryChartData.map((item, index) => [
      item.status,
      {
        label: item.status,
        color: chartPalette[index % chartPalette.length],
      },
    ]),
  );

  const metrics = overview
    ? [
        formatCurrency(overview.totalRevenue),
        String(overview.totalOrders),
        String(overview.totalCustomers),
        String(overview.totalProducts),
        String(overview.totalCoupons),
        String(overview.newUsers30d),
      ]
    : [];

  const isEmpty = !isLoading && !error && !data;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-10 pt-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-4xl border border-stone-200 bg-linear-to-br from-[#2f2218] via-[#4d3727] to-[#8a5b2f] p-6 text-white shadow-2xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.08),transparent_38%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-amber-50/90">
              <LayoutDashboard className="size-3.5" />
              Ecommerce dashboard
            </div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Admin overview for orders, revenue, and catalog performance.
            </h1>
            <p className="max-w-xl text-sm leading-6 text-amber-50/80 sm:text-base">
              Aggregated from MongoDB so you can track store growth, order flow,
              and merchandising health in one place.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-amber-50/90 backdrop-blur">
              <div className="flex items-center gap-2 font-medium">
                <Clock3 className="size-4" />
                Last updated
              </div>
              <p className="mt-1 text-xs text-amber-50/70">
                {lastUpdated
                  ? lastUpdated.toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Waiting for data"}
              </p>
            </div>
            <Button
              type="button"
              onClick={fetchDashboard}
              disabled={isLoading}
              className="rounded-2xl bg-white text-stone-900 hover:bg-amber-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 size-4" />
                  Refresh dashboard
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <Card className="mt-6 border-destructive/20 bg-destructive/5">
          <CardPanel className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <AlertCircle className="size-10 text-destructive" />
            <div>
              <p className="font-medium text-destructive">{error}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The summary endpoint could not be loaded.
              </p>
            </div>
            <Button type="button" variant="outline" onClick={fetchDashboard}>
              Try again
            </Button>
          </CardPanel>
        </Card>
      ) : isEmpty ? (
        <Card className="mt-6">
          <CardPanel className="flex flex-col items-center justify-center gap-3 py-14 text-center">
            <BarChart3 className="size-10 text-muted-foreground" />
            <div>
              <p className="font-medium">No dashboard data yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create paid orders and products to populate the dashboard.
              </p>
            </div>
          </CardPanel>
        </Card>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Revenue"
              value={metrics[0]}
              icon={CircleDollarSign}
              accent="bg-gradient-to-br from-amber-500 to-orange-600"
            />
            <StatCard
              label="Paid Orders"
              value={metrics[1]}
              icon={ShoppingBag}
              accent="bg-gradient-to-br from-stone-700 to-stone-900"
            />
            <StatCard
              label="Customers"
              value={metrics[2]}
              icon={Users}
              accent="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <StatCard
              label="Products"
              value={metrics[3]}
              icon={Package}
              accent="bg-gradient-to-br from-rose-500 to-pink-600"
            />
            <StatCard
              label="Coupons"
              value={metrics[4]}
              icon={TicketPercent}
              accent="bg-gradient-to-br from-indigo-500 to-sky-600"
            />
            <StatCard
              label="New users (30d)"
              value={metrics[5]}
              icon={ArrowUpRight}
              accent="bg-gradient-to-br from-amber-700 to-stone-800"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Card className="overflow-hidden border-stone-200/80 bg-white/95 shadow-sm">
              <CardHeader className="space-y-1 border-b bg-stone-50/80 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-amber-700" />
                  Revenue trend
                </CardTitle>
                <CardDescription>
                  Monthly sales from the last six months.
                </CardDescription>
              </CardHeader>
              <CardPanel className="space-y-4">
                {revenueChartData.length > 0 ? (
                  <ChartContainer
                    className="h-72 w-full"
                    config={revenueChartConfig}
                  >
                    <AreaChart
                      data={revenueChartData}
                      margin={{ left: 2, right: 12 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={12}
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        tickFormatter={(value) =>
                          formatShortCurrency(Number(value))
                        }
                      />
                      <ChartTooltip content={ChartTooltipContent} />
                      <Area
                        dataKey="revenue"
                        type="monotone"
                        stroke="var(--color-revenue)"
                        fill="var(--color-revenue)"
                        fillOpacity={0.18}
                        strokeWidth={3}
                      />
                      <Area
                        dataKey="orders"
                        type="monotone"
                        stroke="var(--color-orders)"
                        fill="var(--color-orders)"
                        fillOpacity={0.08}
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                ) : (
                  <EmptyStateCard
                    title="No revenue data"
                    description="Once orders are paid, this chart will show monthly revenue and order volume."
                    icon={BarChart3}
                  />
                )}
              </CardPanel>
            </Card>

            <Card className="overflow-hidden border-stone-200/80 bg-white/95 shadow-sm">
              <CardHeader className="space-y-1 border-b bg-stone-50/80 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="size-5 text-amber-700" />
                  Delivery flow
                </CardTitle>
                <CardDescription>
                  Latest delivery state across all paid orders.
                </CardDescription>
              </CardHeader>
              <CardPanel className="space-y-4">
                {deliveryChartData.length > 0 ? (
                  <ChartContainer
                    className="h-72 w-full"
                    config={deliveryChartConfig}
                  >
                    <PieChart>
                      <ChartTooltip
                        content={(props) => (
                          <ChartTooltipContent {...props} hideLabel />
                        )}
                      />
                      <Pie
                        data={deliveryChartData}
                        dataKey="count"
                        nameKey="status"
                        innerRadius={78}
                        outerRadius={108}
                        paddingAngle={4}
                        strokeWidth={2}
                      >
                        {deliveryChartData.map((entry, index) => (
                          <Cell
                            key={entry.status}
                            fill={chartPalette[index % chartPalette.length]}
                          />
                        ))}
                      </Pie>
                      <ChartLegend content={<ChartLegendContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <EmptyStateCard
                    title="No delivery data"
                    description="Delivery distribution will appear here as orders move through the workflow."
                    icon={Truck}
                  />
                )}

                <div className="rounded-2xl border border-stone-200 bg-linear-to-br from-amber-50 to-white p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-stone-800">
                    <CheckCircle2 className="size-4 text-emerald-600" />
                    Operational snapshot
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-xs text-muted-foreground">
                        Active products
                      </p>
                      <p className="mt-1 text-lg font-semibold text-stone-900">
                        {overview?.activeProducts ?? 0}
                      </p>
                    </div>
                    <div className="rounded-xl bg-white p-3 shadow-sm">
                      <p className="text-xs text-muted-foreground">
                        Active coupons
                      </p>
                      <p className="mt-1 text-lg font-semibold text-stone-900">
                        {overview?.activeCoupons ?? 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardPanel>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card className="overflow-hidden border-stone-200/80 bg-white/95 shadow-sm">
              <CardHeader className="space-y-1 border-b bg-stone-50/80 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Package className="size-5 text-amber-700" />
                  Top products
                </CardTitle>
                <CardDescription>
                  Best performing products by order count and revenue.
                </CardDescription>
              </CardHeader>
              <CardPanel className="space-y-4">
                {topProducts.map((product) => {
                  const barWidth = (product.orders / maxTopProductOrders) * 100;

                  return (
                    <div
                      key={product.id}
                      className="space-y-2 rounded-2xl border border-stone-100 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-stone-900">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {product.category} · SKU {product.sku}
                          </p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-semibold text-stone-900">
                            {product.orders} orders
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(product.revenue)}
                          </p>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-stone-100">
                        <div
                          className="h-2 rounded-full bg-linear-to-r from-amber-500 to-stone-800"
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </CardPanel>
            </Card>

            <Card className="overflow-hidden border-stone-200/80 bg-white/95 shadow-sm">
              <CardHeader className="space-y-1 border-b bg-stone-50/80 pb-4">
                <CardTitle className="flex items-center gap-2">
                  <LayoutDashboard className="size-5 text-amber-700" />
                  Catalog mix
                </CardTitle>
                <CardDescription>
                  Product distribution across store categories.
                </CardDescription>
              </CardHeader>
              <CardPanel className="space-y-4">
                {categoryChartData.length > 0 ? (
                  <ChartContainer
                    className="h-72 w-full"
                    config={categoryChartConfig}
                  >
                    <BarChart
                      data={categoryChartData}
                      margin={{ top: 8, right: 12 }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={10}
                        fontSize={12}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                      />
                      <ChartTooltip content={ChartTooltipContent} />
                      <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                        {categoryChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={chartPalette[index % chartPalette.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                ) : (
                  <EmptyStateCard
                    title="No catalog data"
                    description="Category distribution appears here once products are created."
                    icon={LayoutDashboard}
                  />
                )}
              </CardPanel>
            </Card>
          </div>

          <Card className="overflow-hidden border-stone-200/80 bg-white/95 shadow-sm">
            <CardHeader className="space-y-1 border-b bg-stone-50/80 pb-4">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="size-5 text-amber-700" />
                Recent orders
              </CardTitle>
              <CardDescription>
                The latest paid orders flowing through the store.
              </CardDescription>
            </CardHeader>
            <CardPanel>
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
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">
                          {order.receipt}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-stone-900">
                              {order.user.name || "Unknown user"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {order.user.email || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-stone-900">
                              {order.product.name || "Product"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              SKU: {order.product.sku || "-"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-stone-900">
                          {formatCurrency(order.amount, order.currency)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={deliveryBadgeVariant[order.latestStatus]}
                          >
                            {order.latestStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardPanel>
          </Card>
        </div>
      )}
    </div>
  );
}
