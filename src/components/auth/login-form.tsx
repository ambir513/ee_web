"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { LoginSchema } from "./type";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Logo from "@/utils/logo";
import { useRouter } from "next/navigation";
import { toastManager } from "../ui/toast";
import { api } from "@/lib/api";

type Schema = z.infer<typeof LoginSchema>;

export function LoginForm({ className, ...props }: { className?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  const route = useRouter();
  const [message, setMessage] = useState<{ status: boolean; message: string }>({
    status: true,
    message: "",
  });

  const form = useForm<Schema>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: Schema) => {
    try {
      const result = await api.post("/auth/login", data);
      if (!result.status) {
        setMessage({ status: false, message: result.message });
        return;
      }
      toastManager.add({
        type: "success",
        title: result.message,
      });
      route.push("/");
    } catch (error: any) {
      console.log(error);
      setMessage({ status: false, message: error?.message });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="text-center flex flex-col gap-4 items-center">
        <Logo width={80} height={80} className="rounded-2xl border " />
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Login to Ethnic Elegance</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Please login to continue
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* ================= EMAIL ================= */}
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Email *</label>

              <Input {...field} type="email" placeholder="Enter your email" />

              {fieldState.error && (
                <p className="text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        {/* ================= PASSWORD ================= */}
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password *</label>
                <Link href="/forgot-password">
                  <p className="text-sm font-medium  hover:underline hover:underline-offset-4">
                    Forgot Password?
                  </p>
                </Link>
              </div>

              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {fieldState.error && (
                <p className="text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
              {message.message && (
                <p className="text-sm text-red-500">{message.message}</p>
              )}
            </div>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
