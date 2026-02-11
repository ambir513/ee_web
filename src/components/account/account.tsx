"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { ProfileHeader } from "@/components/account/profile-header";
import { PersonalInfoTab } from "@/components/account/personal-info-tab";
import { AddressTab } from "@/components/account/address-tab";
import { CartTab } from "@/components/account/cart-tab";
import { OrdersTab } from "@/components/account/orders-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, ShoppingCart, Package, Loader2 } from "lucide-react";

const VALID_TABS = ["personal", "address", "cart", "orders"] as const;
type TabValue = (typeof VALID_TABS)[number];

function getTabFromHash(): TabValue {
  if (typeof window === "undefined") return "personal";
  const hash = window.location.hash.replace("#", "");
  return VALID_TABS.includes(hash as TabValue)
    ? (hash as TabValue)
    : "personal";
}

export function Account() {
  const [activeTab, setActiveTab] = useState<TabValue>("personal");
  const queryClient = useQueryClient();

  // Use cached user data from header (no refetch needed)
  const { data: userData, isLoading, isError } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me", { queryClient });
      return response;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnMount: false, // Don't refetch on mount, use cache from header
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  useEffect(() => {
    setActiveTab(getTabFromHash());
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setActiveTab(getTabFromHash());
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleTabChange = useCallback((value: string) => {
    const tab = value as TabValue;
    setActiveTab(tab);
    window.history.replaceState(
      null,
      "",
      tab === "personal" ? "/account" : `/account#${tab}`,
    );
  }, []);

  // Format join date
  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    } catch {
      return "Recently joined";
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading your account...</p>
        </div>
      </main>
    );
  }

  // Show error state
  if (isError || !userData?.status) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Unable to load account data. Please try again.
          </p>
        </div>
      </main>
    );
  }

  const user = userData.data;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <ProfileHeader
        avatar={user.avatar}
          name={user.name || user.email?.split("@")[0] || "User"}
          email={user.email || ""}
          role={user.role?.toUpperCase() || "USER"}
          joinedDate={user.createdAt ? formatJoinDate(user.createdAt) : "Recently joined"}
          location={user.location || user.city || "Not specified"}
          onEditProfile={() => handleTabChange("personal")}
        />

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mt-4 sm:mt-6"
        >
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            <TabsTrigger
              value="personal"
              className="flex items-center gap-1.5 px-2 py-2 text-[11px] sm:px-3 sm:text-sm"
            >
              <User className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">Personal</span>
            </TabsTrigger>
            <TabsTrigger
              value="address"
              className="flex items-center gap-1.5 px-2 py-2 text-[11px] sm:px-3 sm:text-sm"
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">Address</span>
            </TabsTrigger>
            <TabsTrigger
              value="cart"
              className="flex items-center gap-1.5 px-2 py-2 text-[11px] sm:px-3 sm:text-sm"
            >
              <ShoppingCart className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">Cart</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="flex items-center gap-1.5 px-2 py-2 text-[11px] sm:px-3 sm:text-sm"
            >
              <Package className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">Orders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <PersonalInfoTab />
          </TabsContent>
          <TabsContent value="address">
            <AddressTab />
          </TabsContent>
          <TabsContent value="cart">
            <CartTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
