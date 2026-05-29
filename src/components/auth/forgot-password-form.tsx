"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Logo from "@/utils/logo";
import { ForgotPasswordEmailSchema, ForgotPasswordSchema } from "./type";
import { api } from "@/lib/api";
import { toastManager } from "../ui/toast";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type EmailSchema = z.infer<typeof ForgotPasswordEmailSchema>;
type PasswordSchema = z.infer<typeof ForgotPasswordSchema>;

type Step = "email" | "password" | "otp" | "success";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Header */}
      <div className="text-center flex flex-col gap-4 items-center">
        <Logo width={80} height={80} className="rounded-2xl border" />
        <StepHeader step={step} />
      </div>

      {/* Progress indicator */}
      <StepIndicator currentStep={step} />

      {/* Step content */}
      {step === "email" && (
        <EmailStep
          onNext={(emailValue) => {
            setEmail(emailValue);
            setStep("password");
          }}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {step === "password" && (
        <PasswordStep
          email={email}
          onNext={(password) => {
            setNewPassword(password);
            setStep("otp");
          }}
          onBack={() => setStep("email")}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}

      {step === "otp" && (
        <OTPStep
          email={email}
          newPassword={newPassword}
          onSuccess={() => setStep("success")}
          onBack={() => setStep("password")}
        />
      )}

      {step === "success" && <SuccessStep />}

      {/* Footer */}
      {step !== "success" && (
        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link href="/login" className="font-medium hover:underline">
            Back to Login
          </Link>
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Step Header
   ───────────────────────────────────────────────────────────────────────────── */

function StepHeader({ step }: { step: Step }) {
  const headers: Record<Step, { title: string; subtitle: string }> = {
    email: {
      title: "Reset your password",
      subtitle: "Enter the email associated with your account",
    },
    password: {
      title: "Create new password",
      subtitle: "Choose a strong password for your account",
    },
    otp: {
      title: "Verify your identity",
      subtitle: "Enter the code sent to your email",
    },
    success: {
      title: "Password updated",
      subtitle: "Your password has been reset successfully",
    },
  };

  const { title, subtitle } = headers[step];

  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Step Indicator
   ───────────────────────────────────────────────────────────────────────────── */

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { key: Step; icon: React.ReactNode; label: string }[] = [
    { key: "email", icon: <Mail size={14} />, label: "Email" },
    { key: "password", icon: <Lock size={14} />, label: "Password" },
    { key: "otp", icon: <ShieldCheck size={14} />, label: "Verify" },
  ];

  const stepOrder: Step[] = ["email", "password", "otp", "success"];
  const currentIndex = stepOrder.indexOf(currentStep);

  if (currentStep === "success") return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((s, i) => {
        const stepIndex = stepOrder.indexOf(s.key);
        const isActive = stepIndex === currentIndex;
        const isCompleted = stepIndex < currentIndex;

        return (
          <div key={s.key} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                isActive && "bg-primary text-primary-foreground",
                isCompleted && "bg-primary/10 text-primary",
                !isActive && !isCompleted && "bg-muted text-muted-foreground"
              )}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 transition-colors",
                  stepIndex < currentIndex ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Step 1: Email
   ───────────────────────────────────────────────────────────────────────────── */

function EmailStep({
  onNext,
  errorMessage,
  setErrorMessage,
}: {
  onNext: (email: string) => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
}) {
  const form = useForm<EmailSchema>({
    resolver: zodResolver(ForgotPasswordEmailSchema),
    defaultValues: { email: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: EmailSchema) => {
    setErrorMessage("");
    // We just validate the email format here and move to password step.
    // The actual API call happens after the password is set.
    onNext(data.email);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Email address</label>
            <Input
              {...field}
              type="email"
              placeholder="you@example.com"
              autoFocus
              autoComplete="email"
            />
            {fieldState.error && (
              <p className="text-sm text-red-500">
                {fieldState.error.message}
              </p>
            )}
          </div>
        )}
      />

      {errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        Continue
      </Button>
    </form>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Step 2: New Password
   ───────────────────────────────────────────────────────────────────────────── */

function PasswordStep({
  email,
  onNext,
  onBack,
  errorMessage,
  setErrorMessage,
}: {
  email: string;
  onNext: (password: string) => void;
  onBack: () => void;
  errorMessage: string;
  setErrorMessage: (msg: string) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<PasswordSchema>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (data: PasswordSchema) => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      // Call the forgot-password API to send OTP
      const res = await api.post("/auth/forgot-password", {
        email,
        newPassword: data.password,
      });

      if (res.status) {
        toastManager.add({
          type: "success",
          title: "Verification code sent to your email",
        });
        onNext(data.password);
      } else {
        setErrorMessage(res.message);
        toastManager.add({
          type: "error",
          title: res.message,
          timeout: 5000,
        });
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
        Resetting password for <strong className="text-foreground">{email}</strong>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Controller
          name="password"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">New password</label>
              <div className="relative">
                <Input
                  {...field}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  autoFocus
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldState.error && (
                <p className="text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
              <PasswordStrength password={field.value} />
            </div>
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Confirm password</label>
              <div className="relative">
                <Input
                  {...field}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldState.error && (
                <p className="text-sm text-red-500">
                  {fieldState.error.message}
                </p>
              )}
            </div>
          )}
        />

        {errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="w-full"
        >
          {isSubmitting || isLoading ? "Sending code..." : "Send verification code"}
        </Button>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Step 3: OTP Verification
   ───────────────────────────────────────────────────────────────────────────── */

function OTPStep({
  email,
  newPassword,
  onSuccess,
  onBack,
}: {
  email: string;
  newPassword: string;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 6) {
      toastManager.add({
        type: "error",
        title: "Please enter the complete 6-digit code",
      });
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await api.post("/auth/verify-forgot-password", {
        email,
        code: otp,
      });

      if (res.status) {
        toastManager.add({
          type: "success",
          title: "Password updated successfully",
        });
        await queryClient.invalidateQueries({ queryKey: ["getUser"] });
        onSuccess();
      } else {
        setOtp("");
        setErrorMessage(res.message);
        toastManager.add({
          type: "error",
          title: res.message,
        });
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setErrorMessage("");

    try {
      const res = await api.post("/auth/forgot-password", {
        email,
        newPassword,
      });

      if (res.status) {
        setOtp("");
        toastManager.add({
          type: "success",
          title: "New code sent to your email",
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
        title: "Failed to resend code. Please try again.",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <form
        className="flex justify-center items-center flex-col gap-5"
        onSubmit={onSubmit}
      >
        <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground text-center w-full">
          Code sent to <strong className="text-foreground">{email}</strong>
        </div>

        <Field>
          <FieldLabel htmlFor="forgot-otp" className="sr-only">
            Verification code
          </FieldLabel>
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            id="forgot-otp"
            autoFocus
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
            Code expires in 2 minutes
          </FieldDescription>
        </Field>

        {errorMessage && (
          <p className="text-sm text-red-500 text-center">{errorMessage}</p>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Reset password"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleResend}
            disabled={isResending}
          >
            {isResending ? "Sending..." : "Resend"}
          </Button>
        </p>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Success State
   ───────────────────────────────────────────────────────────────────────────── */

function SuccessStep() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <ShieldCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          You can now log in with your new password.
        </p>
      </div>

      <Button className="w-full" onClick={() => router.push("/login")}>
        Go to Login
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   Password Strength Indicator
   ───────────────────────────────────────────────────────────────────────────── */

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Lowercase", met: /[a-z]/.test(password) },
    { label: "Uppercase", met: /[A-Z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special char", met: /[^a-zA-Z0-9]/.test(password) },
  ];

  if (!password) return null;

  const metCount = checks.filter((c) => c.met).length;
  const strength =
    metCount <= 2 ? "weak" : metCount <= 4 ? "medium" : "strong";
  const strengthColors = {
    weak: "bg-red-500",
    medium: "bg-yellow-500",
    strong: "bg-green-500",
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= metCount ? strengthColors[strength] : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Requirements */}
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {checks.map((check) => (
          <span
            key={check.label}
            className={cn(
              "text-xs transition-colors",
              check.met ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
            )}
          >
            {check.met ? "✓" : "○"} {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}
