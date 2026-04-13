"use client";

import React, { useState } from "react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import {
  Field,
  FieldLabel,
  FieldItem,
  FieldDescription,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  CheckCircle2,
  Settings,
  Store,
  Globe,
  Bell,
  Palette,
  Instagram,
  Facebook,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

interface StoreSettings {
  // Store Info
  storeName: string;
  tagline: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  address: string;

  // Social Links
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;

  // Announcement
  announcementEnabled: boolean;
  announcementText: string;

  // Preferences
  maintenanceMode: boolean;
  codEnabled: boolean;
  freeShippingThreshold: string;
  gstNumber: string;
}

export default function GeneralSettingsCard() {
  const [data, setData] = useState<StoreSettings>({
    storeName: "Ethnic Elegance",
    tagline: "Where tradition meets style",
    description:
      "Celebrating the artistry of Indian textiles through contemporary designs. Each piece is crafted with love and tradition.",
    contactEmail: "",
    contactPhone: "",
    address: "",

    instagramUrl: "https://www.instagram.com/ethnic_elegance_1110/?hl=en",
    facebookUrl: "",
    youtubeUrl: "https://www.youtube.com/@EthnicElegance_1110",

    announcementEnabled: false,
    announcementText: "",

    maintenanceMode: false,
    codEnabled: true,
    freeShippingThreshold: "999",
    gstNumber: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Integrate with API when endpoint is ready
      // const response = await api.post("/admin/settings/general", data);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Failed to save settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = <K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K]
  ) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mx-5 sm:mx-auto sm:max-w-3xl space-y-6 pb-10">
      {/* Page Header */}
      <div className="space-y-1 pt-2">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="size-6" />
          General Settings
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage your store information, social links, and preferences.
        </p>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-6">
        {/* ─── Store Information ─── */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Store className="size-5" />
              Store Information
            </CardTitle>
            <CardDescription>
              Basic details about your store that appear across the website.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="storeName">Store Name</FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="storeName"
                    placeholder="Ethnic Elegance"
                    value={data.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                  />
                </FieldItem>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="tagline">Tagline</FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="tagline"
                    placeholder="Where tradition meets style"
                    value={data.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                  />
                </FieldItem>
                <FieldDescription>
                  Appears below your store name in the header.
                </FieldDescription>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="description">
                  Store Description
                </FieldLabel>
                <FieldItem className="w-full">
                  <Textarea
                    id="description"
                    placeholder="Tell customers about your brand..."
                    value={data.description}
                    className="min-h-[80px]"
                    onChange={(e) => updateField("description", e.target.value)}
                  />
                </FieldItem>
                <FieldDescription>
                  Used in the footer and SEO meta description.
                </FieldDescription>
              </Field>

              <Separator className="sm:col-span-2" />

              <Field>
                <FieldLabel htmlFor="contactEmail">
                  <span className="flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    Contact Email
                  </span>
                </FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="hello@ethnicelegance.in"
                    value={data.contactEmail}
                    onChange={(e) =>
                      updateField("contactEmail", e.target.value)
                    }
                  />
                </FieldItem>
              </Field>

              <Field>
                <FieldLabel htmlFor="contactPhone">
                  <span className="flex items-center gap-1.5">
                    <Phone className="size-3.5" />
                    Contact Phone
                  </span>
                </FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={data.contactPhone}
                    onChange={(e) =>
                      updateField("contactPhone", e.target.value)
                    }
                  />
                </FieldItem>
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel htmlFor="address">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="size-3.5" />
                    Store Address
                  </span>
                </FieldLabel>
                <FieldItem className="w-full">
                  <Textarea
                    id="address"
                    placeholder="123 Fashion Street, Jaipur, Rajasthan 302001"
                    value={data.address}
                    className="min-h-[60px]"
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                </FieldItem>
              </Field>
            </div>
          </CardPanel>
        </Card>

        {/* ─── Social Links ─── */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Globe className="size-5" />
              Social Links
            </CardTitle>
            <CardDescription>
              Connect your social media profiles. These appear in the footer.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="grid gap-5">
              <Field>
                <FieldLabel htmlFor="instagramUrl">
                  <span className="flex items-center gap-1.5">
                    <Instagram className="size-3.5" />
                    Instagram URL
                  </span>
                </FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="instagramUrl"
                    type="url"
                    placeholder="https://instagram.com/yourstore"
                    value={data.instagramUrl}
                    onChange={(e) =>
                      updateField("instagramUrl", e.target.value)
                    }
                  />
                </FieldItem>
              </Field>

              <Field>
                <FieldLabel htmlFor="facebookUrl">
                  <span className="flex items-center gap-1.5">
                    <Facebook className="size-3.5" />
                    Facebook URL
                  </span>
                </FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="facebookUrl"
                    type="url"
                    placeholder="https://facebook.com/yourstore"
                    value={data.facebookUrl}
                    onChange={(e) =>
                      updateField("facebookUrl", e.target.value)
                    }
                  />
                </FieldItem>
              </Field>

              <Field>
                <FieldLabel htmlFor="youtubeUrl">
                  <span className="flex items-center gap-1.5">
                    <Youtube className="size-3.5" />
                    YouTube URL
                  </span>
                </FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="youtubeUrl"
                    type="url"
                    placeholder="https://youtube.com/@yourstore"
                    value={data.youtubeUrl}
                    onChange={(e) => updateField("youtubeUrl", e.target.value)}
                  />
                </FieldItem>
              </Field>
            </div>
          </CardPanel>
        </Card>

        {/* ─── Announcement Banner ─── */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="size-5" />
              Announcement Banner
            </CardTitle>
            <CardDescription>
              Display a site-wide banner at the top of your store.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="grid gap-5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Enable Announcement
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show a banner at the top of every page.
                  </p>
                </div>
                <Switch
                  checked={data.announcementEnabled}
                  onCheckedChange={(checked) =>
                    updateField("announcementEnabled", checked)
                  }
                />
              </div>

              {data.announcementEnabled && (
                <Field>
                  <FieldLabel htmlFor="announcementText">
                    Banner Message
                  </FieldLabel>
                  <FieldItem className="w-full">
                    <Input
                      id="announcementText"
                      placeholder="🎉 Free shipping on orders above ₹999!"
                      value={data.announcementText}
                      onChange={(e) =>
                        updateField("announcementText", e.target.value)
                      }
                    />
                  </FieldItem>
                  <FieldDescription>
                    Keep it short and impactful — max 80 characters recommended.
                  </FieldDescription>
                </Field>
              )}

              {/* Live Preview */}
              {data.announcementEnabled && data.announcementText && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Preview
                  </p>
                  <div className="bg-foreground text-primary-foreground text-center py-2 px-4 text-sm font-medium">
                    {data.announcementText}
                  </div>
                </div>
              )}
            </div>
          </CardPanel>
        </Card>

        {/* ─── Store Preferences ─── */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Palette className="size-5" />
              Store Preferences
            </CardTitle>
            <CardDescription>
              Configure shipping, payment, and operational settings.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex items-center justify-between sm:col-span-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Maintenance Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Temporarily disable the storefront for customers.
                  </p>
                </div>
                <Switch
                  checked={data.maintenanceMode}
                  onCheckedChange={(checked) =>
                    updateField("maintenanceMode", checked)
                  }
                />
              </div>

              {data.maintenanceMode && (
                <div className="sm:col-span-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                    </span>
                    Your store will be hidden from customers while maintenance
                    mode is active.
                  </p>
                </div>
              )}

              <Separator className="sm:col-span-2" />

              <div className="flex items-center justify-between sm:col-span-2">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">
                    Cash on Delivery
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow customers to pay at the time of delivery.
                  </p>
                </div>
                <Switch
                  checked={data.codEnabled}
                  onCheckedChange={(checked) =>
                    updateField("codEnabled", checked)
                  }
                />
              </div>

              <Field>
                <FieldLabel htmlFor="freeShippingThreshold">
                  Free Shipping Threshold (₹)
                </FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    min={0}
                    placeholder="999"
                    value={data.freeShippingThreshold}
                    onChange={(e) =>
                      updateField("freeShippingThreshold", e.target.value)
                    }
                  />
                </FieldItem>
                <FieldDescription>
                  Orders above this amount get free shipping. Set 0 to disable.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="gstNumber">GST Number</FieldLabel>
                <FieldItem className="w-full">
                  <Input
                    id="gstNumber"
                    placeholder="29ABCDE1234F1Z5"
                    value={data.gstNumber}
                    onChange={(e) => updateField("gstNumber", e.target.value)}
                  />
                </FieldItem>
                <FieldDescription>
                  Your GSTIN for invoices and tax compliance.
                </FieldDescription>
              </Field>
            </div>
          </CardPanel>
        </Card>

        {/* ─── Error & Submit ─── */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            className="min-w-[160px]"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : isSaved ? (
              <>
                <CheckCircle2 className="mr-2 size-4" />
                Saved!
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          {isSaved && (
            <span className="text-sm text-green-600 animate-in fade-in duration-300">
              Settings saved successfully
            </span>
          )}
        </div>
      </Form>
    </div>
  );
}
