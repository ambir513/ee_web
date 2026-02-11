import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/utils/get-user";

/**
 * Proxy middleware that fetches user state and adds it to request headers
 * This allows downstream services to access authenticated user information
 */
export async function proxyMiddleware(request: NextRequest) {
  try {
    // Get user from JWT token in cookies
    const user = await getUser();

    // Clone the request headers
    const requestHeaders = new Headers(request.headers);

    // Add user information to headers if user exists
    if (user) {
      // Serialize user object to JSON string for header
      requestHeaders.set("x-user-data", JSON.stringify(user));
      requestHeaders.set("x-user-id", user.id?.toString() || "");
      requestHeaders.set("x-user-email", user.email || "");
      requestHeaders.set("x-user-role", user.role || "user");
      requestHeaders.set("x-authenticated", "true");
    } else {
      requestHeaders.set("x-authenticated", "false");
    }

    // Create a new response with modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    return response;
  } catch (error) {
    console.error("Proxy middleware error:", error);
    // Continue without user data if there's an error
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
