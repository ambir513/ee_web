import type { Metadata } from "next";
import { Account } from "@/components/account/account";
import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";

export const metadata: Metadata = {
  title: "My Account",
  description:
    "Manage your Ethnic Elegance account – view orders, addresses, wishlist and personal information.",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <>
      <Header />
      <Account />
      <Footer />
    </>
  );
}
