"use client";

import { Truck, RotateCcw, Shield, Sparkles } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Complimentary Shipping",
    description: "Free delivery on every order, nationwide",
  },
  {
    icon: RotateCcw,
    title: "Exchange Only",
    description: "Hassle-free exchanges within 7 days",
  },
  {
    icon: Shield,
    title: "Secure Checkout",
    description: "SSL-encrypted payments you can trust",
  },
  {
    icon: Sparkles,
    title: "Artisan Crafted",
    description: "Handcrafted with heritage techniques",
  },
];

export function Features() {
  return (
    <section className="py-12 border-t border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <feature.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
