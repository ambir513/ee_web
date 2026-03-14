/**
 * Universal API helper for Next.js with TanStack Query integration
 * - Uses native fetch (available on both server and client)
 * - Automatically resolves base URL depending on environment
 * - Supports custom headers including user state from TanStack Query
 */

const BASE_URL =
  typeof window === "undefined"
    ? process.env.BACKEND_URL // server (private allowed)
    : process.env.NEXT_PUBLIC_BACKEND_URL; // client (public only)

if (!BASE_URL) {
  throw new Error("Backend URL is not defined");
}

type ApiOptions = RequestInit & {
  queryClient?: any; // TanStack Query client for accessing cached user state
};

type ApiFailure = {
  status: false;
  message: string;
  data?: null;
};

/**
 * Helper function to get user data from TanStack Query cache
 */
function getUserFromQueryCache(queryClient?: any) {
  if (!queryClient || typeof window === "undefined") {
    return null;
  }

  try {
    // Get user data from the "getUser" query cache
    const userData = queryClient.getQueryData(["getUser"]);
    return userData?.data || null;
  } catch (error) {
    console.error("Error getting user from query cache:", error);
    return null;
  }
}

/**
 * Build headers with user state from TanStack Query
 */
function buildHeaders(options: ApiOptions = {}) {
  const headers = new Headers(options.headers);

  // Get user from TanStack Query cache if available
  const user = getUserFromQueryCache(options.queryClient);

  if (user) {
    headers.set("x-user-data", JSON.stringify(user));
    headers.set("x-user-id", user.id?.toString() || "");
    headers.set("x-user-email", user.email || "");
    headers.set("x-user-role", user.role || "user");
    headers.set("x-authenticated", "true");
  }

  return headers;
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  if (isJson) {
    try {
      const data = (await res.json()) as T;
      if (!res.ok && data && typeof data === "object" && "status" in (data as any)) {
        return data;
      }
      if (!res.ok) {
        return {
          status: false,
          message: res.statusText || `Request failed with status ${res.status}`,
          data: null,
        } as T;
      }
      return data;
    } catch {
      return {
        status: false,
        message: "Invalid JSON response from server",
        data: null,
      } as T;
    }
  }

  const text = await res.text();
  if (!res.ok) {
    return {
      status: false,
      message: text || res.statusText || `Request failed with status ${res.status}`,
      data: null,
    } as T;
  }

  return {
    status: false,
    message: "Unexpected non-JSON response from server",
    data: null,
  } as T;
}

async function safeFetch<T>(url: string, init: RequestInit): Promise<T> {
  try {
    const res = await fetch(url, init);
    return parseApiResponse<T>(res);
  } catch (error: any) {
    const message =
      typeof error?.message === "string" && error.message.length > 0
        ? error.message
        : "Network error. Please check your connection.";

    return {
      status: false,
      message,
      data: null,
    } as T;
  }
}

export const api = {
  get: async <T = any>(endpoint: string, options: ApiOptions = {}) => {
    return safeFetch<T>(BASE_URL + endpoint, {
      method: "GET",
      credentials: "include",
      headers: buildHeaders(options),
      ...options,
    });
  },

  post: async <T = any>(
    endpoint: string,
    data: unknown,
    options: ApiOptions = {},
  ) => {
    const headers = buildHeaders(options);
    headers.set("Content-Type", "application/json");

    return safeFetch<T>(BASE_URL + endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
      ...options,
    });
  },

  patch: async <T = any>(
    endpoint: string,
    data: unknown,
    options: ApiOptions = {},
  ) => {
    const headers = buildHeaders(options);
    headers.set("Content-Type", "application/json");

    return safeFetch<T>(BASE_URL + endpoint, {
      method: "PATCH",
      headers,
      body: JSON.stringify(data),
      credentials: "include",
      ...options,
    });
  },

  delete: async <T = any>(endpoint: string, options: ApiOptions = {}) => {
    return safeFetch<T>(BASE_URL + endpoint, {
      method: "DELETE",
      credentials: "include",
      headers: buildHeaders(options),
      ...options,
    });
  },
};
