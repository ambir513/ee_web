"use client";

import {
  Calendar,
  LayoutDashboard,
  Home,
  ImagePlus,
  Inbox,
  List,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const items = [
  {
    name: "Dashboard",
    list: [
      {
        title: "Overview",
        url: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    name: "Products",
    list: [
      {
        title: "Create Product",
        url: "/admin/product/create",
        icon: ImagePlus,
      },
      {
        title: "Products List",
        url: "/admin/product",
        icon: List,
      },
    ],
  },
  {
    name: "Orders",
    list: [
      {
        title: "Orders List & status",
        url: "/admin/orders",
        icon: Inbox,
      },
    ],
  },
  {
    name: "Coupon Code",
    list: [
      {
        title: "Create Coupons",
        url: "/admin/coupon/create",
        icon: ImagePlus,
      },
      {
        title: "Coupons List",
        url: "/admin/coupon",
        icon: List,
      },
    ],
  },
  {
    name: "Settings",
    list: [
      { title: "General", url: "/admin/general", icon: Settings },
      { title: "Home Page", url: "/", icon: Home },
    ],
  },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {items.map((group) => (
          <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.list.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={
                        <Link href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      }
                    >
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
