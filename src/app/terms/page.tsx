"use client";

import Link from "next/link";
import {
  FileText,
  ShieldCheck,
  Truck,
  RotateCcw,
  CreditCard,
  UserCog,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    title: "Introduction",
    body: `By accessing or using our website and services, you agree to be bound by these Terms and Conditions. If you do not agree, please discontinue use.`,
  },
  {
    title: "Accounts",
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. Notify us immediately of unauthorized use.`,
  },
  {
    title: "Orders & Payments",
    body: `All orders are subject to availability and acceptance. Prices and promotions may change. You agree to provide accurate billing, shipping, and payment information.`,
  },
  {
    title: "Shipping & Delivery",
    body: `Estimated delivery dates are not guaranteed. Risk of loss transfers to you upon delivery to the carrier. Inspect packages upon receipt and report issues promptly.`,
  },
  {
    title: "Returns & Refunds",
    body: `We offer exchange only. Refunds are not provided. Eligible exchange requests must be raised within the stated window, and items must be unused, in original condition, and with tags attached.`,
  },
  {
    title: "Use of Content",
    body: `All content (text, images, assets) is owned by or licensed to us. You may not copy, distribute, or modify content without permission.`,
  },
  {
    title: "Prohibited Activities",
    body: `Do not engage in fraud, abuse, reverse engineering, interference with the site, or any unlawful activity. We may suspend accounts for violations.`,
  },
  {
    title: "Privacy",
    body: `Your use of the site is also governed by our Privacy Policy. Review it to understand how we collect and use your data.`,
  },
  {
    title: "Limitation of Liability",
    body: `To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of the services.`,
  },
  {
    title: "Changes to Terms",
    body: `We may update these Terms from time to time. Continued use after changes constitutes acceptance of the revised Terms.`,
  },
  {
    title: "Contact",
    body: `For questions about these Terms, contact our support team via the Help Center or email.`,
  },
];

export default function TermsPage() {
  const highlights = [
    { label: "Accounts", icon: UserCog },
    { label: "Orders", icon: CreditCard },
    { label: "Shipping", icon: Truck },
    { label: "Returns", icon: RotateCcw },
    { label: "Privacy", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-8 sm:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <section className="rounded-2xl border border-border bg-card p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Legal Information
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
              Terms & Conditions
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Please read these terms carefully before using our website,
              placing an order, or using our services. By continuing to use
              Ethnic Elegance, you agree to the terms described below.
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
                Quick jump to each section
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {sections.map((section, idx) => (
                <a
                  key={section.title}
                  href={`#section-${idx + 1}`}
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
              <CardTitle className="text-xl">Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                This summary highlights key points. Please review the full
                sections below.
              </p>
            </CardHeader>
            <CardContent className="space-y-5 sm:space-y-6">
              {sections.map((section, idx) => (
                <article
                  id={`section-${idx + 1}`}
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
                  {idx < sections.length - 1 && <Separator className="pt-1" />}
                </article>
              ))}
            </CardContent>
          </Card>
        </section>

        <div className="mt-6 flex flex-col gap-4 rounded-xl border bg-card px-4 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p>Questions about these terms? Our support team can help.</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/contact">Contact Support</Link>}
            />
            <Button
              variant="outline"
              size="sm"
              render={<Link href="/policy">Privacy & Policy</Link>}
            />
            <Button
              size="sm"
              variant={"secondary"}
              render={<Link href="/">Return Home</Link>}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
