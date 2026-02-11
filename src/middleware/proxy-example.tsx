/**
 * Example: Using the proxy middleware with TanStack Query
 * 
 * This file demonstrates how to use the api helper with TanStack Query
 * to automatically include user state in API request headers.
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function ExampleComponent() {
  const queryClient = useQueryClient();

  // Fetch user data (this gets cached in TanStack Query)
  const { data: userData } = useQuery({
    queryKey: ["getUser"],
    queryFn: async () => {
      const response = await api.get("/account/me");
      return response;
    },
  });

  // Make an API call that automatically includes user data in headers
  const { data: productsData } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // Pass queryClient to enable header injection from TanStack Query cache
      const response = await api.get("/products", { queryClient });
      return response;
    },
    // Only fetch when user is loaded
    enabled: !!userData,
  });

  // Example: POST request with user headers
  const handleCreateOrder = async (orderData: any) => {
    try {
      const response = await api.post("/orders", orderData, { queryClient });
      console.log("Order created with user context:", response);
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <div>
      <h1>Example Component</h1>
      {userData?.status && (
        <p>Logged in as: {userData.data.email}</p>
      )}
      {/* Your component JSX */}
    </div>
  );
}

/**
 * Server-side usage (Server Components):
 * 
 * The Next.js middleware automatically injects user data into headers
 * for all server-side requests. You can access these headers in:
 * - API routes
 * - Server components
 * - Server actions
 * 
 * Example in an API route:
 * 
 * export async function GET(request: Request) {
 *   const userId = request.headers.get('x-user-id');
 *   const userEmail = request.headers.get('x-user-email');
 *   const userRole = request.headers.get('x-user-role');
 *   const userData = JSON.parse(request.headers.get('x-user-data') || '{}');
 *   
 *   // Use user data for authorization, personalization, etc.
 * }
 */
