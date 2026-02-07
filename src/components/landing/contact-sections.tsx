"use client";

import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, Mail, MapPin } from "lucide-react";

const MUMBAI_CENTRAL_MAP_EMBED =
  "https://maps.google.com/maps?q=Mumbai+Central,+Mumbai,+Maharashtra,+India&t=&z=15&ie=UTF8&iwloc=&output=embed";

const PRIMARY = "#1f3a56";

export default function ContactPageContent() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="bg-background">
      {/* Banner */}
      <section className="relative h-[260px] sm:h-[300px] md:h-[360px] w-full overflow-hidden">
        <Image
          src="/images/kurta-1.jpg"
          alt="Ethnic Elegance kurta collection"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(to bottom, ${PRIMARY}99 0%, ${PRIMARY}cc 100%)` }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p
            className="text-xs font-medium tracking-[0.2em] uppercase mb-2"
            style={{ color: "rgba(255,255,255,0.9)" }}
          >
            Get in touch
          </p>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-white sm:text-4xl md:text-5xl">
            Contact
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
            We’re here to help with orders, sizing, and your ethnic wear journey.
          </p>
        </div>
      </section>

      {/* Form + Map section – professional block */}
      <section className="px-4 py-16 md:py-24 bg-muted/25">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-10 md:mb-12">
            <p
              className="text-xs font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: PRIMARY }}
            >
              Send a message
            </p>
            <h2 className="text-2xl font-bold text-foreground md:text-3xl text-balance">
              We’d love to hear from you
            </h2>
            <p className="mt-2 text-muted-foreground leading-relaxed max-w-xl">
              Have a question about your order, our collection, or something else? Fill in the form
              and we’ll get back to you within 24–48 hours.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 lg:items-stretch">
            {/* Left: Form – professional panel with header */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-[0_4px_24px_-4px_rgba(31,58,86,0.1),0_2px_8px_-2px_rgba(31,58,86,0.06)]">
              {/* Form header strip – primary */}
              <div
                className="flex items-center gap-2 px-6 py-4"
                style={{ backgroundColor: PRIMARY }}
              >
                <Mail className="size-5 text-white" strokeWidth={1.5} />
                <span className="text-sm font-semibold tracking-wide text-white">
                  Contact form
                </span>
              </div>
              <div className="p-6 sm:p-8 bg-card">
                {status === "success" ? (
                  <div className="text-center py-8">
                    <div
                      className="inline-flex size-14 items-center justify-center rounded-full mb-5"
                      style={{ backgroundColor: `${PRIMARY}18` }}
                    >
                      <CheckCircle2 className="size-7" style={{ color: PRIMARY }} strokeWidth={1.5} />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">Message sent</h3>
                    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                      We’ll reply to your email within 24–48 hours.
                    </p>
                    <Button
                      variant="outline"
                      size="default"
                      className="mt-6 rounded-lg"
                      style={{
                        borderColor: `${PRIMARY}40`,
                        color: PRIMARY,
                      }}
                      onClick={() => setStatus("idle")}
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <Label htmlFor="contact-name" className="text-sm font-medium text-foreground">
                        Name
                      </Label>
                      <Input
                        id="contact-name"
                        name="name"
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        autoComplete="name"
                        className="mt-2 h-11 rounded-lg border-input bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email" className="text-sm font-medium text-foreground">
                        Email
                      </Label>
                      <Input
                        id="contact-email"
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                        className="mt-2 h-11 rounded-lg border-input bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-subject" className="text-sm font-medium text-foreground">
                        Subject
                      </Label>
                      <Input
                        id="contact-subject"
                        name="subject"
                        type="text"
                        placeholder="Order, returns, or general enquiry"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="mt-2 h-11 rounded-lg border-input bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-message" className="text-sm font-medium text-foreground">
                        Message
                      </Label>
                      <Textarea
                        id="contact-message"
                        name="message"
                        placeholder="How can we help?"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="mt-2 min-h-[110px] resize-none rounded-lg border-input bg-background py-3"
                      />
                    </div>
                    {status === "error" && (
                      <p className="text-sm text-destructive">
                        Something went wrong. Please try again.
                      </p>
                    )}
                    <Button
                      type="submit"
                      className="w-full h-11 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: PRIMARY }}
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Sending…
                        </>
                      ) : (
                        "Send message"
                      )}
                    </Button>
                  </form>
                )}
                <p className="mt-6 text-sm text-muted-foreground">
                  Or email us at{" "}
                  <a
                    href="mailto:support@ethnicelegance.store"
                    className="font-medium underline underline-offset-2 hover:no-underline"
                    style={{ color: PRIMARY }}
                  >
                    support@ethnicelegance.store
                  </a>
                </p>
              </div>
            </div>

            {/* Right: Map – matching professional panel */}
            <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-[0_4px_24px_-4px_rgba(31,58,86,0.1),0_2px_8px_-2px_rgba(31,58,86,0.06)] h-[340px] sm:h-[400px] lg:h-auto lg:min-h-[460px]">
              <div
                className="flex items-center gap-2 px-6 py-4"
                style={{ backgroundColor: PRIMARY }}
              >
                <MapPin className="size-5 text-white" strokeWidth={1.5} />
                <span className="text-sm font-semibold tracking-wide text-white">
                  Find us – Mumbai Central
                </span>
              </div>
              <iframe
                src={MUMBAI_CENTRAL_MAP_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mumbai Central – Ethnic Elegance"
                className="block w-full h-[calc(100%-3.5rem)] min-h-[280px] lg:min-h-[400px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
