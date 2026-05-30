import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Reset Password",
  description:
    "Reset your Ethnic Elegance account password securely with email verification.",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">
          <ForgotPasswordForm />
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/wallpaper.png"
          width={1080}
          height={1920}
          alt="Reset password background"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
