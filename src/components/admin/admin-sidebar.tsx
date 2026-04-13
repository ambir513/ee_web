"use client";

import {
  Calendar,
  Home,
  ImagePlus,
  Inbox,
  List,
  Search,
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
        title: "Orders List",
        url: "/admin/orders",
        icon: Inbox,
      },
      {
        title: "Orders Status",
        url: "/admin/orders",
        icon: Calendar,
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
