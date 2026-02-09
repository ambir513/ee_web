"use client";

import { ArrowUpRight, Menu, ShoppingBag, User } from "lucide-react";
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
import { ProductSearchBar } from "@/components/search/product-search-bar";

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
    <div className="w-full z-50 bg-secondary    ">
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

        <section className="overflow-hidden leading-5 pb-2">
          <InfiniteSlider speedOnHover={20} speed={40} gap={112}>
            <p>
              Apply Code: <strong>500OFF</strong> – Get ₹500 off on minimum
              purchase of ₹3,999 | Apply Code: <strong>500OFF</strong> – Get
              ₹500 off on minimum purchase of ₹3,999
            </p>
          </InfiniteSlider>
        </section>
      </div>

      {/* Main Header */}
      <header
        className={`w-full border-b border-border bg-background/80 backdrop-blur-sm transition-all duration-300
        ${scrolled ? "fixed top-0 shadow-md z-50" : ""}`}
      >
        <nav className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Top row: logo, navigation, user actions */}
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Left: mobile menu + logo */}
            <div className="flex items-center gap-3">
              <div className="md:hidden">
                <Sheet>
                  <SheetTrigger
                    render={
                      <Button
                        aria-label="Open navigation"
                        variant={"outline"}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border  text-muted-foreground hover:bg-accent transition-colors"
                      >
                        <Menu className="size-5" />
                      </Button>
                    }
                  ></SheetTrigger>

                  <SheetContent
                    side="left"
                    className="flex h-screen max-h-screen flex-col justify-between px-0"
                  >
                    <div className="space-y-6 px-6 pt-4 pb-6">
                      <SheetHeader className="items-start text-left">
                        <SheetTitle className="flex items-center gap-x-3">
                          <Image
                            src="/logo.jpeg"
                            alt="Ethnic Elegance Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                          />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-lg font-serif font-semibold">
                              Ethnic Elegance
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Curated ethnic wear for every occasion
                            </span>
                          </div>
                        </SheetTitle>
                      </SheetHeader>

                      <div className="space-y-5">
                        <div>
                          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Shop
                          </p>
                          <ul className="space-y-3">
                            {links.map((link) => (
                              <li key={link.id}>
                                <SheetClose
                                  render={
                                    <Link
                                      href={link.href}
                                      target={link.arrowUp ? "_blank" : "_self"}
                                      className="flex items-center justify-between text-sm text-muted-foreground hover:text-foreground"
                                    >
                                      <span>{link.title}</span>
                                      {link.arrowUp && (
                                        <ArrowUpRight className="size-3" />
                                      )}
                                    </Link>
                                  }
                                />
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-border pt-4">
                          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                            Help & Info
                          </p>
                          <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                              <SheetClose
                                render={
                                  <Link
                                    href="/contact"
                                    className="hover:text-foreground"
                                  >
                                    Contact us
                                  </Link>
                                }
                              />
                            </li>
                            <li>
                              <SheetClose
                                render={
                                  <Link
                                    href="/faq"
                                    className="hover:text-foreground"
                                  >
                                    FAQ & support
                                  </Link>
                                }
                              />
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <SheetFooter className="border-t border-border bg-background px-6 py-4">
                      {data?.status ? (
                        <div className="flex w-full flex-col gap-2">
                          <SheetClose
                            render={
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-between"
                                render={
                                  <Link
                                    href="/account"
                                    className="flex w-full items-center justify-between"
                                  >
                                    <span>My account</span>
                                    <User className="size-4" />
                                  </Link>
                                }
                              />
                            }
                          />
                          <SheetClose
                            render={
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full justify-center text-muted-foreground hover:text-foreground"
                              >
                                Sign out
                              </Button>
                            }
                          />
                        </div>
                      ) : (
                        <div className="flex w-full flex-col gap-2">
                          <SheetClose
                            render={
                              <Button
                                size="sm"
                                className="w-full"
                                render={
                                  <Link
                                    href="/auth/login"
                                    className="flex w-full items-center justify-center gap-2 text-white"
                                  >
                                    <User className="size-4" />
                                    <span>Sign in</span>
                                  </Link>
                                }
                              />
                            }
                          />
                          <SheetClose
                            render={
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                render={
                                  <Link
                                    href="/auth/register"
                                    className="flex w-full items-center justify-center gap-2"
                                  >
                                    <span>Create account</span>
                                  </Link>
                                }
                              />
                            }
                          />
                        </div>
                      )}
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              </div>

              <Link href="/">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.jpeg"
                    alt="Ethnic Elegance Logo"
                    width={40}
                    height={40}
                    className="hidden sm:block rounded-lg"
                  />
                  <div className="flex flex-col">
                    <span className="text-2xl sm:text-2xl text-primary font-serif font-bold tracking-tight">
                      Ethnic Elegance
                    </span>
                    <span className="text-xs sm:text-xs text-muted-foreground">
                      Where tradition meets style
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Center: desktop navigation */}
            <ul className="hidden md:flex items-center justify-center gap-6 text-sm">
              {links.map((link) => (
                <li key={link.id}>
                  <Link
                    href={link.href}
                    target={link.arrowUp ? "_blank" : "_self"}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span className="relative">
                      {link.title}
                      {link.arrowUp && (
                        <ArrowUpRight className="size-2.5 absolute -right-3 top-0" />
                      )}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Right: account, cart, primary CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {data?.status ? (
                <UserDropdown user={data.data} />
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <User className="size-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                  <Link
                    href="/cart"
                    className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background hover:bg-accent transition-colors"
                    aria-label="View shopping bag"
                  >
                    <ShoppingBag className="size-4" />
                  </Link>
                </>
              )}

              <div className="hidden sm:block text-white">
                <Button
                  size="sm"
                  render={<Link href="/products">Shop Now</Link>}
                />
              </div>
            </div>
          </div>

       
        </nav>
      </header>
    </div>
  );
}
