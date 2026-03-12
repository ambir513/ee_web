import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your Ethnic Elegance account to access orders, wishlist and exclusive offers.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/wallpaper.png"
          width={1080}
          height={1920}
          alt="Login background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
