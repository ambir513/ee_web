import type { Metadata } from "next";
import { Geist, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { TanstackQueryProvider } from "@/utils/tanstack-query";
import { Analytics } from "@vercel/analytics/next"

const _inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const _playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair-display",
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://ethnicelegance.store";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ethnic Elegance – Premium Women's Ethnic Wear Online",
    template: "%s | Ethnic Elegance",
  },
  description:
    "Shop premium women's ethnic wear at Ethnic Elegance. Explore curated kurtas, sarees, lehengas & more with handcrafted designs, quality fabrics and doorstep delivery across India.",
  keywords: [
    "ethnic wear",
    "women's kurta",
    "saree online",
    "lehenga",
    "Indian fashion",
    "designer kurta",
    "ethnic elegance",
    "women's clothing",
    "online shopping India",
  ],
  authors: [{ name: "Ethnic Elegance" }],
  creator: "Ethnic Elegance",
  publisher: "Ethnic Elegance",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: "Ethnic Elegance",
    title: "Ethnic Elegance – Premium Women's Ethnic Wear Online",
    description:
      "Shop premium women's ethnic wear. Explore curated kurtas, sarees, lehengas & more with handcrafted designs and quality fabrics.",
    images: [
      {
        url: "/images/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Ethnic Elegance – Premium Women's Ethnic Wear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ethnic Elegance – Premium Women's Ethnic Wear Online",
    description:
      "Shop premium women's ethnic wear. Explore curated kurtas, sarees, lehengas & more with handcrafted designs and quality fabrics.",
    images: ["/images/og-banner.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Ethnic Elegance",
        description: "Premium Women's Ethnic Wear Online",
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        potentialAction: [
          {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
            },
            "query-input": "required name=search_term_string",
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Ethnic Elegance",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/images/logo1.png`,
        },
        sameAs: [
          "https://www.instagram.com/ethnic_elegance_1110/?hl=en",
          "https://www.youtube.com/@EthnicElegance_1110",
        ],
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${_inter.className} ${_playfairDisplay.variable} antialiased bg-secondary`}
      >
        <TanstackQueryProvider>
          {children}
          <Analytics />
          <ToastProvider />
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
