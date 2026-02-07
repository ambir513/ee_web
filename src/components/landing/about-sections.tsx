import { Card } from "@/components/ui/card";
import {
  Heart,
  Sparkles,
  ShieldCheck,
  Truck,
  Award,
  Leaf,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: Award,
    title: "Quality First",
    description:
      "Every piece is selected for fabric, finish, and fit. We work with trusted makers so you get garments that last.",
  },
  {
    icon: Heart,
    title: "Authentic Craft",
    description:
      "From traditional weaves to contemporary cuts, we bring you genuine ethnic wear that honours Indian textile heritage.",
  },
  {
    icon: ShieldCheck,
    title: "Trusted Retail",
    description:
      "Secure payments, clear policies, and a dedicated support team. We're here to make your shopping smooth and reliable.",
  },
];

const offerings = [
  {
    title: "Kurtas & Sets",
    description:
      "Everyday and occasion kurtas, sets with palazzos, dupattas, and coordinated bottoms.",
  },
  {
    title: "Sarees & Lehengas",
    description:
      "Elegant sarees and lehengas for festivals, weddings, and special moments.",
  },
  {
    title: "Indo-Western & Casual",
    description:
      "Fusion and casual ethnic wear that fits modern life without losing the ethnic touch.",
  },
];

export function AboutHero() {
  return (
    <section className="relative bg-[#1f3a56] text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(31,58,86,0.97)_0%,rgba(31,58,86,0.92)_100%)]" />
      <div className="relative mx-auto max-w-4xl px-4 py-20 sm:py-24 text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80 mb-4">
          Our Story
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
          Ethnic Elegance
        </h1>
        <p className="mt-4 text-base text-white/85 max-w-2xl mx-auto leading-relaxed sm:text-lg">
          A women’s ethnic wear destination for retail customers. Thoughtfully
          curated garments that blend tradition with everyday style.
        </p>
      </div>
    </section>
  );
}

export function AboutStory() {
  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-14 md:grid-cols-2 md:gap-16 md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Who we are
            </p>
            <h2 className="text-2xl font-semibold text-foreground md:text-3xl mb-6 tracking-tight">
              Built for you
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ethnic Elegance is a women’s garments and cloth retail website
              focused on ethnic and Indo-Western wear—kurtas, sets, sarees,
              lehengas, and more—sourced and curated for quality and value.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Whether you’re shopping for daily wear, office looks, or
              celebrations, we aim to be your go-to for reliable, easy-to-shop
              ethnic fashion delivered to your doorstep.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {offerings.map((item, i) => (
              <Card
                key={i}
                className="p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow transition-shadow"
              >
                <Sparkles
                  className="size-6 text-primary mb-3"
                  strokeWidth={1.5}
                />
                <h3 className="font-semibold text-foreground mb-1.5 text-sm">
                  {item.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutValues() {
  return (
    <section className="bg-muted/40 py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-4">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Our values
          </p>
          <h2 className="text-2xl font-semibold text-foreground md:text-3xl tracking-tight">
            What we stand for
          </h2>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto text-sm">
            They guide every product we list and every order we deliver.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((item, i) => (
            <Card
              key={i}
              className="p-6 rounded-xl border border-border bg-card shadow-sm"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/8 text-primary mb-4">
                <item.icon className="size-5" strokeWidth={1.5} />
              </span>
              <h3 className="font-semibold text-foreground mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutWhyUs() {
  const items = [
    {
      icon: Truck,
      title: "Fast delivery",
      description: "Reliable shipping so your order reaches you on time.",
    },
    {
      icon: Leaf,
      title: "Curated collection",
      description: "Handpicked women’s ethnic wear for every occasion.",
    },
    {
      icon: ShieldCheck,
      title: "Secure & easy returns",
      description: "Shop with confidence; we’re here if you need to exchange or return.",
    },
    {
      icon: Heart,
      title: "Customer first",
      description: "We listen and improve so your experience stays smooth.",
    },
  ];

  return (
    <section className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">
          Why choose us
        </p>
        <h2 className="text-2xl font-semibold text-foreground md:text-3xl text-center tracking-tight mb-12">
          Why shop with us
        </h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center px-4"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary/8 text-primary mb-4">
                <item.icon className="size-6" strokeWidth={1.5} />
              </span>
              <h3 className="font-semibold text-foreground mb-1.5 text-sm">
                {item.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutCta() {
  return (
    <section className="border-t border-border bg-[#1f3a56] text-white py-16 md:py-20">
      <div className="mx-auto max-w-2xl px-4 text-center">
        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Ready to explore?
        </h2>
        <p className="mt-3 text-white/85 text-sm sm:text-base">
          Discover kurtas, sets, sarees, and more—for the modern woman who loves
          ethnic elegance.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="h-11 rounded-lg bg-white text-[#1f3a56] hover:bg-white/90 font-medium"
          >
            <Link href="/products">Shop now</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 rounded-lg border-white/40 text-white hover:bg-white/10 hover:text-white font-medium"
          >
            <Link href="/contact">Contact us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
