"use client";
import {
  HelpCircle,
  LogOut,
  ScrollText,
  Settings,
  ShieldUser,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BsCart } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { IoMdHeartEmpty } from "react-icons/io";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { api } from "@/lib/api";
import { toastManager } from "../ui/toast";

const UserDropdown = ({ user }: { user: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Sync with cart data
  const { data: cartData } = useQuery({
    queryKey: ["getCart"],
    queryFn: () => api.get("/addtocart/all", { queryClient }),
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const cartItems = cartData?.data || [];
  const cartCount = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);

  const handleLogout = async () => {
    setIsLoading(true);
    const response = await api.get("/auth/logout");
    if (response.status) {
      router.push("/login");
      toastManager.add({
        title: "Logged out",
        description: "You have been logged out successfully.",
        type: "success",
      });
      return null;
    }
    toastManager.add({
      title: "Logout failed",
      description: "An error occurred while logging out. Please try again.",
      type: "error",
    });
    setIsLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="relative h-10 w-10 rounded-full" variant="outline">
            <User className="size-5" />
          </Button>
        }
      ></DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-secondary border-4">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm leading-none">{user?.name}</p>
              <p className="text-muted-foreground text-xs leading-none">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <Link href={"/account"}>
            <DropdownMenuItem>
              <User />
              Profile
            </DropdownMenuItem>
          </Link>

          {user?.role === "ADMIN" && (
            <Link href={"/admin"}>
              <DropdownMenuItem>
                <ShieldUser />
                Admin Panel
              </DropdownMenuItem>
            </Link>
          )}
          <Link href={"/account#orders"}>
            <DropdownMenuItem>
              <ScrollText />
              Order
            </DropdownMenuItem>
          </Link>
          <Link href={"/account#cart"}>
            <DropdownMenuItem>
              <div className="flex justify-between w-full">
                <p className="flex justify-center items-center gap-x-2">
                  <BsCart />
                  <span> My Cart </span>
                </p>
                {cartCount > 0 && (
                  <Badge className="text-white">{cartCount}</Badge>
                )}
              </div>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <IoMdHeartEmpty />
            My Wishlist
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle />
            Help
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant={isLoading ? "default" : "destructive"}
            onClick={handleLogout}
            onSelect={(e) => e.preventDefault()}
          >
            <div className="relative">
              <p
                className={cn(
                  "flex justify-center items-center gap-x-2",
                  isLoading && "opacity-5",
                )}
              >
                <LogOut />
                Log out
              </p>
              {isLoading && (
                <p className="absolute top-0 left-6">
                  <Spinner />
                </p>
              )}
            </div>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default UserDropdown;
