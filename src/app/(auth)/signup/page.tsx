import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join Ethnic Elegance – create your account to shop premium women's ethnic wear with exclusive member benefits.",
  robots: { index: false, follow: false },
};

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <SignupForm />
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
