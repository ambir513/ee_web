"use client";

import { ArrowUpRight, Menu, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { Banner } from "@/components/ui/banner";
import { InfiniteSlider } from "../ui/infinite-slider";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import UserDropdown from "./user-dropdown";
// import UserDropdown from "./user-dropdown";

export const gradientColors = [
  "rgba(0,149,255,0.56)",
  "rgba(231,77,255,0.77)",
  "rgba(255,0,0,0.73)",
  "rgba(131,255,166,0.66)",
];

const links = [
  { title: "Kurta set", href: "/products", id: 1, arrowUp: false },
  { title: "New Arrivals", href: "/new-arrivals", id: 2, arrowUp: false },
  { title: "Best Sellers", href: "/best-sellers", id: 3, arrowUp: false },
  { title: "About", href: "/about", id: 4, arrowUp: false },
  { title: "Contact", href: "/contact", id: 5, arrowUp: true },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me");
      return response;
    },
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="w-full z-50">
      {/* Banner + Offer Slider */}
      <div
        className={`transition-all space-y-2 duration-300 ease-in-out
        ${scrolled ? "-translate-y-full opacity-0 pointer-events-none" : "translate-y-0 opacity-100"}`}
      >
        <Banner
          title="🎉 10% OFF!"
          description="For First Order - Use Code: WELCOME10"
          variant="minimal"
          gradientColors={gradientColors}
        />

        <section className="overflow-hidden leading-5">
          <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
            <p>
              Apply Code: <strong>500OFF</strong> – Get ₹500 off on minimum
              purchase of ₹3,999 | Apply Code: <strong>500OFF</strong> – Get
              ₹500 off on minimum purchase of ₹3,999
            </p>
          </InfiniteSlider>
        </section>
      </div>

      {/* Header */}
      <header
        className={`w-full py-4 sm:px-4 px-2 border-b bg-background transition-all duration-300
        ${scrolled ? "fixed top-0 shadow-md z-50" : ""}`}
      >
        <nav className="max-w-7xl pr-4 2xl:mx-auto">
          <div className="flex items-center justify-between  h-10">
            {/* Logo + Links */}

            <div className="flex items-center gap-x-5">
              <ul className="hidden text-sm sm:flex space-x-6">
                {links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.arrowUp ? "_blank" : "_self"}
                      className="text-muted-foreground flex items-center gap-x-1"
                    >
                      <span className="hover:text-primary relative">
                        {link.title}
                        {link.arrowUp && (
                          <ArrowUpRight className="size-2.5 absolute -right-3 top-0" />
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="sm:hidden">
              <Sheet>
                <SheetTrigger>
                  <Menu className="text-muted-foreground" />
                </SheetTrigger>

                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-x-3">
                      <Image
                        src="/logo.jpeg"
                        alt="Ethnic Elegance Logo"
                        width={35}
                        height={35}
                        className="rounded-lg"
                      />
                      Ethnic Elegance
                    </SheetTitle>
                    <SheetDescription>
                      Find the perfect ethnic wear for every occasion.
                    </SheetDescription>
                  </SheetHeader>

                  <ul className="mt-6 flex flex-col gap-y-4 pl-6">
                    {links.map((link) => (
                      <li key={link.id}>
                        <Link
                          href={link.href}
                          target={link.arrowUp ? "_blank" : "_self"}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>

                  <SheetFooter className="mt-6 text-white fixed bottom-0 left-0 w-full pb-6 px-6">
                    <Button
                      render={<Link href="/event-enquiry">Enquire Now</Link>}
                    ></Button>
                    <SheetClose
                      render={<Button variant="outline">Close</Button>}
                    ></SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </div>

            <div className="flex  justify-center items-center gap-x-2">
              <Link href="/">
                <div className="flex flex-col justify-center items-center gap-x-2">
                  <h1 className="text-2xl text-primary font-serif font-bold">
                    Ethnic Elegance
                  </h1>
                  <p className="text-xs/1 font-primary">
                    Where tradition meets style
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop CTA */}
            <div className="hidden sm:flex gap-x-3 text-white  sm:items-center sm:gap-x-4 ">
              {data?.status ? (
                <UserDropdown user={data.data} />
              ) : (
                <ShoppingBag />
              )}
              <Button render={<Link href="/products"></Link>}>Shop Now</Button>
            </div>

            {/* Mobile Menu */}
            <div className="flex sm:hidden items-center gap-x-4">
              <ShoppingBag />
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
