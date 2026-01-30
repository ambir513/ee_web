import {
  Calendar,
  Home,
  ImagePlus,
  Inbox,
  List,
  Search,
  Settings,
  SquarePen,
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
        url: "#",
        icon: ImagePlus,
      },
      {
        title: "Products List",
        url: "#",
        icon: List,
      },
      {
        title: "Edit Product",
        url: "#",
        icon: SquarePen,
      },
    ],
  },
  {
    name: "Orders",
    list: [
      {
        title: "Orders List",
        url: "#",
        icon: Inbox,
      },
      {
        title: "Orders Status",
        url: "#",
        icon: Calendar,
      },
    ],
  },
  {
    name: "Coupon Code",
    list: [
      {
        title: "Create Coupons",
        url: "#",
        icon: ImagePlus,
      },
      {
        title: "Coupons List",
        url: "#",
        icon: List,
      },
    ],
  },
  {
    name: "Settings",
    list: [
      { title: "General", url: "#", icon: Settings },
      { title: "Search", url: "#", icon: Search },
      { title: "Home Page", url: "#", icon: Home },
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
