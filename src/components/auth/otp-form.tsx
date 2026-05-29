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
import { useQueryClient } from "@tanstack/react-query";

interface OTPFormProps {
  className?: string;
  email: string;
  name?: string;
}

export function OTPForm({
  className,
  email,
  name,
  ...props
}: OTPFormProps & Omit<React.ComponentProps<"div">, "email">) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 6) {
      toastManager.add({
        type: "error",
        title: "Please enter a valid 6-digit code",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/verify-email", {
        email,
        code: otp,
      });

      if (res.status) {
        toastManager.add({
          type: "success",
          title: res.message,
        });
        // Invalidate user query so account syncs immediately
        await queryClient.invalidateQueries({ queryKey: ["getUser"] });
        router.push("/");
      } else {
        setOtp("");
        toastManager.add({
          type: "error",
          title: res.message,
        });
      }
    } catch {
      toastManager.add({
        type: "error",
        title: "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reSendOTPSubmit = async () => {
    setIsResending(true);
    try {
      const res = await api.post("/auth/resend-otp", {
        name: name || "",
        email,
        password: "",
      });

      if (res.status) {
        setOtp("");
        toastManager.add({
          type: "success",
          title: "OTP resent successfully",
        });
      } else {
        toastManager.add({
          type: "error",
          title: res.message,
        });
      }
    } catch {
      toastManager.add({
        type: "error",
        title: "Failed to resend OTP. Please try again.",
      });
    } finally {
      setIsResending(false);
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
            We sent a 6-digit code to <strong>{email}</strong>
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
        <Button type="submit" className="w-[250px]" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>
        <Field>
          <FieldDescription className="text-center text-sm">
            Didn&apos;t receive the code?{" "}
            <Button
              type="button"
              variant={"outline"}
              size={"xs"}
              onClick={reSendOTPSubmit}
              disabled={isResending}
            >
              {isResending ? "Sending..." : "Resend"}
            </Button>
          </FieldDescription>
        </Field>
      </form>
    </div>
  );
}
