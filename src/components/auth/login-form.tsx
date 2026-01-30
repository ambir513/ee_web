"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [responseDetails, setResponseDetails] = useState<null | {
    status: boolean;
    message: string;
  }>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = fetch(process.env.NEXT_PUBLIC_BACKEND_URL! + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const response = await (await res).json();
      setResponseDetails({
        status: response.success,
        message: response.message,
      });
    } catch (error) {
      console.error("Error during login:", error);
      setResponseDetails({
        status: false,
        message: "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Login to Ethnic Elegance
        </h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Please login to continue
        </p>
      </div>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="text-sm text-muted-foreground underline-offset-4 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <Input
              className="bg-background"
              id="password-toggle"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
            <Button
              className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              size="icon"
              type="button"
              variant="ghost"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </div>
          <div>
            {!responseDetails?.status && (
              <p className="text-sm text-red-600">{responseDetails?.message}</p>
            )}
          </div>
        </div>
        <Button disabled={isLoading} type="submit" className="mt-4 w-full">
          {isLoading ? <Spinner className="mr-2" /> : null}
          {isLoading ? "Login..." : "Login"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
