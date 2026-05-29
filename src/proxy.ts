import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// ─── Route Definitions ───────────────────────────────────────────────────────

/** Routes accessible only to unauthenticated users (redirect to home if logged in) */
const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

/** Routes that require authentication (redirect to login if not logged in) */
const PROTECTED_ROUTES = ["/account", "/track", "/checkout"];

/** Routes that require admin role */
const ADMIN_ROUTES = ["/admin"];

// ─── Config ──────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || ""
);

const LOGIN_URL = "/login";
const HOME_URL = "/";
const ADMIN_URL = "/admin";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserPayload {
  _id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Verify and decode JWT token using Edge-compatible `jose` library.
 * Returns the user payload or null if token is invalid/expired.
 */
async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserPayload;
  } catch {
    return null;
  }
}

/**
 * Check if the current pathname starts with any of the given route prefixes.
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// ─── Proxy Function ──────────────────────────────────────────────────────────

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Extract token from cookies
  const token = request.cookies.get("token")?.value;

  // Verify user authentication
  const user = token ? await verifyToken(token) : null;
  const isAuthenticated = !!user;

  // ── Auth Routes (login, signup, forgot-password) ──
  // Redirect authenticated users away from auth pages
  if (matchesRoute(pathname, AUTH_ROUTES)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(HOME_URL, request.url));
    }
    return NextResponse.next();
  }

  // ── Admin Routes ──
  // Require authentication + admin role
  if (matchesRoute(pathname, ADMIN_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL(LOGIN_URL, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (user.role !== "ADMIN") {
      return NextResponse.redirect(new URL(HOME_URL, request.url));
    }
    // Pass user data downstream via headers
    return createAuthenticatedResponse(request, user);
  }

  // ── Protected Routes ──
  // Require authentication
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    if (!isAuthenticated) {
      const loginUrl = new URL(LOGIN_URL, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return createAuthenticatedResponse(request, user);
  }

  // ── Public Routes ──
  // Pass user data if available (useful for conditional UI)
  if (isAuthenticated) {
    return createAuthenticatedResponse(request, user);
  }

  return NextResponse.next();
}

/**
 * Creates a NextResponse that forwards user data via request headers.
 * Downstream server components can read these headers for auth state.
 */
function createAuthenticatedResponse(
  request: NextRequest,
  user: UserPayload
): NextResponse {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user._id);
  requestHeaders.set("x-user-email", user.email);
  requestHeaders.set("x-user-role", user.role);
  requestHeaders.set("x-authenticated", "true");

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

// ─── Matcher Config ──────────────────────────────────────────────────────────

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Static assets (images, fonts, etc.)
     * - API routes (handled separately)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)",
  ],
};
