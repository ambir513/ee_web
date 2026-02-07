import { Header } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
import { Features } from "@/components/landing/feature";
import ContactPageContent from "@/components/landing/contact-sections";

export const metadata = {
  title: "Contact | Ethnic Elegance",
  description:
    "Contact Ethnic Elegance. We respond within 24–48 hours.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="font-sans min-h-screen bg-background">
        <ContactPageContent />
        <Features />
      </main>
      <Footer />
    </>
  );
}
