import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  Truck,
  BadgeX,
  RotateCcw,
  Wallet,
} from "lucide-react";

import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: "Privacy & Policy",
  description:
    "Read Ethnic Elegance privacy, shipping, cancellation and returns policies.",
  alternates: { canonical: "/policy" },
  keywords: [
    "privacy policy",
    "shipping policy",
    "cancellation policy",
    "refund policy",
    "return policy",
    "ethnic elegance policy",
  ],
  openGraph: {
    title: "Privacy & Policy | Ethnic Elegance",
    description:
      "Review Ethnic Elegance privacy, shipping, cancellation, return, exchange, and refund policies.",
    url: "/policy",
    type: "article",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ethnic Elegance Privacy & Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy & Policy | Ethnic Elegance",
    description:
      "Review Ethnic Elegance privacy, shipping, cancellation, return, exchange, and refund policies.",
    images: ["/images/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const policySections = [
  {
    title: "Privacy Policy",
    body: "We collect only the information required to process orders, provide support, and improve your shopping experience. Personal details are stored securely and are never sold to third parties.",
  },
  {
    title: "Shipping Policy",
    body: "Orders are usually processed within 1-3 business days. Delivery timelines vary by location and courier partner availability. Tracking details are shared once your order is dispatched.",
  },
  {
    title: "Cancellation Policy",
    body: "Orders can be cancelled before dispatch. Once an order is shipped, cancellation may not be possible. For urgent cancellation requests, please contact support immediately.",
  },
  {
    title: "Return & Exchange Policy",
    body: "We provide exchange only for eligible products as per product listing conditions. Items must be unused, with original tags and packaging, and the request must be raised within the allowed exchange window.",
  },
  {
    title: "Refund Policy",
    body: "No refunds are provided. Orders are eligible only for exchange where applicable and approved under our exchange policy.",
  },
  {
    title: "Support & Contact",
    body: "For order, delivery, return or payment-related help, contact us at support@ethnicelegance.store or use the Contact Us page. Our team responds in 24-48 business hours.",
  },
];

export default function PolicyPage() {
  const highlights = [
    { label: "Privacy", icon: ShieldCheck },
    { label: "Shipping", icon: Truck },
    { label: "Cancellation", icon: BadgeX },
    { label: "Returns", icon: RotateCcw },
    { label: "Refund", icon: Wallet },
  ];

  return (
    <>
      <Header />
      <main className="min-h-screen bg-muted/20 px-4 py-8 sm:py-10">
        <div className="mx-auto w-full max-w-6xl">
          <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 sm:gap-5">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
                <FileCheck2 className="h-3.5 w-3.5" />
                Customer Policies
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
                Privacy & Policy
              </h1>
              <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                This page provides clear policy standards for privacy, shipping,
                cancellation, returns, and refunds so you can shop with
                confidence.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {highlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {item.label}
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: March 14, 2026
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
            <Card className="h-fit lg:sticky lg:top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">On This Page</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Quick jump to each policy section
                </p>
              </CardHeader>
              <CardContent className="space-y-2">
                {policySections.map((section, idx) => (
                  <a
                    key={section.title}
                    href={`#policy-${idx + 1}`}
                    className="flex items-center justify-between rounded-md border border-transparent px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50 hover:text-foreground"
                  >
                    <span className="truncate pr-3">{section.title}</span>
                    <span className="text-xs">{idx + 1}</span>
                  </a>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-2">
                <CardTitle className="text-xl">Policy Summary</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review each section carefully before placing orders or
                  requesting support.
                </p>
              </CardHeader>
              <CardContent className="space-y-5 sm:space-y-6">
                {policySections.map((section, idx) => (
                  <article
                    id={`policy-${idx + 1}`}
                    key={section.title}
                    className="scroll-mt-28 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-base font-semibold sm:text-lg">
                        {section.title}
                      </h2>
                      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs text-muted-foreground">
                        {idx + 1}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                      {section.body}
                    </p>
                    {idx < policySections.length - 1 && (
                      <Separator className="pt-1" />
                    )}
                  </article>
                ))}
              </CardContent>
            </Card>
          </section>

          <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-card px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p>Need clarification on any policy term?</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/contact">Contact Us</Link>}
              />
              <Button
                variant="outline"
                size="sm"
                render={<Link href="/terms">Terms & Conditions</Link>}
              />
              <Button
                size="sm"
                variant="secondary"
                render={<Link href="/">Return Home</Link>}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
