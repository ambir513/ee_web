"use client";

import { ChevronDown, Home, Menu, MapPin, ShoppingBag, User, Phone, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import UserDropdown from "./user-dropdown";

const categories = [
  { title: "Kurta Sets", href: "/products?category=Kurta+Sets", id: "c1" },
  { title: "Sarees", href: "/products?category=Sarees", id: "c2" },
  { title: "Lehengas", href: "/products?category=Lehengas", id: "c3" },
  { title: "Dupattas", href: "/products?category=Dupattas", id: "c4" },
  { title: "All Products", href: "/products", id: "c5" },
];

export function Header() {
  const [catOpen, setCatOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me", { queryClient });
      return response;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });

  // Close categories dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Navbar — always fixed at top */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
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
                            Navigate
                          </p>
                          <ul className="space-y-3">
                            <li>
                              <SheetClose
                                render={
                                  <Link
                                    href="/"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    <Home className="size-4" />
                                    <span>Home</span>
                                  </Link>
                                }
                              />
                            </li>
                            <li>
                              <button
                                type="button"
                                onClick={() => setMobileCatOpen(!mobileCatOpen)}
                                className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground"
                              >
                                <span className="flex items-center gap-2">
                                  <Package className="size-4" />
                                  Categories
                                </span>
                                <ChevronDown className={`size-3.5 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`} />
                              </button>
                              {mobileCatOpen && (
                                <ul className="mt-2 ml-6 space-y-2">
                                  {categories.map((cat) => (
                                    <li key={cat.id}>
                                      <SheetClose
                                        render={
                                          <Link
                                            href={cat.href}
                                            className="text-sm text-muted-foreground hover:text-foreground"
                                          >
                                            {cat.title}
                                          </Link>
                                        }
                                      />
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </li>
                            <li>
                              <SheetClose
                                render={
                                  <Link
                                    href="/contact"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    <Phone className="size-4" />
                                    <span>Contact Us</span>
                                  </Link>
                                }
                              />
                            </li>
                            <li>
                              <SheetClose
                                render={
                                  <Link
                                    href="/track"
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                  >
                                    <MapPin className="size-4" />
                                    <span>Track Order</span>
                                  </Link>
                                }
                              />
                            </li>
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
                                className="w-full text-white justify-between"
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
                                variant={"secondary"}
                                className="w-full text-white"
                                render={
                                  <Link
                                    href="/login"
                                    className="flex w-full items-center justify-center gap-2 "
                                  >
                                    <User className="size-4" />
                                    <span>Login</span>
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
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <div ref={catRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setCatOpen(!catOpen)}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Categories
                    <ChevronDown className={`size-3.5 transition-transform duration-200 ${catOpen ? "rotate-180" : ""}`} />
                  </button>
                  {catOpen && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={cat.href}
                          onClick={() => setCatOpen(false)}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          {cat.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/track"
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MapPin className="size-3.5" />
                  Track Order
                </Link>
              </li>
            </ul>

            {/* Right: account, cart, primary CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {data?.status ? (
                <UserDropdown user={data.data} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs sm:text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  >
                    <User className="size-4" />
                    <span className="hidden sm:inline">Sign in</span>
                  </Link>
                  <Link
                    href="/login"
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

      {/* Spacer — matches navbar height so content isn't hidden */}
      <div className="h-14" />
    </>
  );
}
