"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

/**
 * Hook that provides a function to redirect unauthenticated users to login
 * with the current page as the callbackUrl, so they return after logging in.
 *
 * Usage:
 *   const redirectToLogin = useAuthRedirect();
 *   if (!isLoggedIn) { redirectToLogin(); return; }
 */
export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const redirectToLogin = useCallback(() => {
    const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
    router.push(loginUrl);
  }, [router, pathname]);

  return redirectToLogin;
}
