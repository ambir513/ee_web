import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Ethnic Elegance terms and conditions covering orders, shipping, returns, privacy and usage policies.",
  alternates: { canonical: "/terms" },
  keywords: [
    "terms and conditions",
    "ethnic elegance terms",
    "shopping terms",
    "order policy",
    "returns policy",
    "privacy terms",
  ],
  openGraph: {
    title: "Terms & Conditions | Ethnic Elegance",
    description:
      "Read Ethnic Elegance terms for accounts, orders, shipping, returns, privacy, and platform usage.",
    url: "/terms",
    type: "article",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ethnic Elegance Terms & Conditions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms & Conditions | Ethnic Elegance",
    description:
      "Read Ethnic Elegance terms for accounts, orders, shipping, returns, privacy, and platform usage.",
    images: ["/images/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
