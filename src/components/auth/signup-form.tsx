"use client";
import { Activity, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { OTPForm } from "./otp-form";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { set, z } from "zod";
import Logo from "@/utils/logo";
import { SignupSchema } from "./type";
import { api } from "@/lib/api";
import { toastManager } from "../ui/toast";

type Schema = z.infer<typeof SignupSchema>;
export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{
    status: boolean;
    message: string;
  }>({
    status: false,
    message: "",
  });

  const form = useForm<Schema>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
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
    const res = await api.post("/auth/sign-up", data);
    console.log(res);
    if (res.status) {
      localStorage.setItem("User", JSON.stringify(data));
      setMessage({ status: true, message: res.message });
      toastManager.add({
        type: "success",
        title: res.message,
      });
    } else {
      setMessage({ status: false, message: res.message });
      toastManager.add({
        type: "error",
        title: res.message,
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Activity mode={message.status ? "hidden" : "visible"}>
        <div className="text-center flex flex-col gap-4 items-center">
          <Logo width={80} height={80} className="rounded-2xl border " />
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Create your account</h1>
            <p className="text-sm text-muted-foreground">
              Your ethnic style journey begins here.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ================= EMAIL ================= */}
          <Controller
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Full Name *</label>

                <Input
                  {...field}
                  type="text"
                  placeholder="Enter your full name"
                />

                {fieldState.error && (
                  <p className="text-sm text-red-500">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
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
                <label className="text-sm font-medium">Password *</label>
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
                {!message.message && (
                  <p className="text-sm text-red-500">{message.message}</p>
                )}
              </div>
            )}
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium">
            Login
          </Link>
        </p>
      </Activity>
      <Activity mode={message?.status ? "visible" : "hidden"}>
        <OTPForm />
      </Activity>
    </div>
  );
}
