/**
 * Universal API helper for Next.js (Server + Client compatible)
 * - Uses native fetch (available on both)
 * - Automatically resolves base URL depending on environment
 */

const BASE_URL =
  typeof window === "undefined"
    ? process.env.BACKEND_URL // server (private allowed)
    : process.env.NEXT_PUBLIC_BACKEND_URL; // client (public only)

if (!BASE_URL) {
  throw new Error("Backend URL is not defined");
}

type ApiOptions = RequestInit;

export const api = {
  get: async <T = any>(endpoint: string, options: ApiOptions = {}) => {
    const res = await fetch(BASE_URL + endpoint, {
      method: "GET",
      credentials: "include",
      ...options,
    });

    return res.json() as Promise<T>;
  },

  post: async <T = any>(
    endpoint: string,
    data: unknown,
    options: ApiOptions = {},
  ) => {
    const res = await fetch(BASE_URL + endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      credentials: "include",
      ...options,
    });

    return res.json() as Promise<T>;
  },

  patch: async <T = any>(
    endpoint: string,
    data: unknown,
    options: ApiOptions = {},
  ) => {
    const res = await fetch(BASE_URL + endpoint, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      credentials: "include",
      ...options,
    });

    return res.json() as Promise<T>;
  },

  delete: async <T = any>(endpoint: string, options: ApiOptions = {}) => {
    const res = await fetch(BASE_URL + endpoint, {
      method: "DELETE",
      credentials: "include",
      ...options,
    });

    return res.json() as Promise<T>;
  },
};
