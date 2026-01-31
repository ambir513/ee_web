"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import React, { useState } from "react";
import Logo from "@/utils/logo";
import { api } from "@/lib/api";
import { toastManager } from "../ui/toast";
import { useRouter } from "next/navigation";

export function OTPForm({
  className,
  ...props
}: {
  className?: string;
} & React.ComponentProps<"div">) {
  const [otp, setOtp] = useState("");
  const route = useRouter()
  const data = JSON.parse(localStorage.getItem("User") || "null");
  const [message, setMessage] = useState<{ status: boolean; message: string }>({
    status: true,
    message: "",
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(data);
    if (otp.length < 6) {
      toastManager.add({
        type: "error",
        title: "Please enter a valid 6-digit code",
      });
      return;
    }
    const res = await api.post("/auth/verify-email", {
      email: data?.email,
      code: otp,
    });
    console.log(res);
    if (res.status) {
      localStorage.removeItem("User");
      toastManager.add({
        type: "success",
        title: res.message,
      });
      route.push("/")
    } else {
      setOtp("");
      toastManager.add({
        type: "error",
        title: res.message,
      });
    }
  };

  const reSendOTPSubmit = async () => {
    // :) sign up route to resend otp, haaa!!!
    const res = await api.post("/auth/sign-up", {
      name: data?.name,
      email: data?.email,
      password: data?.password,
    });
    console.log(res);
    if (res.status) {
      setOtp("");
      toastManager.add({
        type: "success",
        title: "OTP resent successfully",
      });
    } else {
      setOtp("");
      toastManager.add({
        type: "error",
        title: res.message,
      });
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="text-center flex flex-col gap-4 items-center">
        <Logo width={80} height={80} className="rounded-2xl border " />
      </div>
      <form
        className="flex justify-center items-center flex-col gap-6"
        onSubmit={onSubmit}
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Enter verification code</h1>
          <p className="text-muted-foreground text-sm text-balance">
            We sent a 6-digit code to your email.
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="otp" className="sr-only">
            Verification code
          </FieldLabel>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            id="otp"
            required
          >
            <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <FieldDescription className="text-center">
            Enter the 6-digit code sent to your email.
          </FieldDescription>
        </Field>
        <Button type="submit" className="w-[250px]">
          Verify
        </Button>
        <Field>
          <FieldDescription className="text-center text-sm">
            Didn&apos;t receive the code?{" "}
            <Button
              type="button"
              variant={"outline"}
              size={"xs"}
              onClick={reSendOTPSubmit}
            >
              Resend
            </Button>
          </FieldDescription>
        </Field>
      </form>
    </div>
  );
}
