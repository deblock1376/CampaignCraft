import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  // Add JWT token for authenticated requests
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const headers: Record<string, string> = {};
    
    // Add JWT token for authenticated requests
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // Properly construct URL from queryKey array
    let url: string;
    if (Array.isArray(queryKey)) {
      if (queryKey.length === 3 && queryKey[0] === '/api/newsrooms') {
        // Handle ["/api/newsrooms", newsroomId, "campaigns"] format
        url = `${queryKey[0]}/${queryKey[1]}/${queryKey[2]}`;
      } else {
        // Default join behavior
        url = queryKey.join('/');
      }
    } else {
      url = queryKey[0] as string;
    }
    console.log('Making authenticated request to:', url, 'with token:', token ? token.substring(0, 20) + '...' : 'none');
    
    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    console.log('Response status:', res.status, 'for', url);
    
    // Log response content type and body for debugging
    const contentType = res.headers.get('content-type');
    if (!res.ok) {
      const responseText = await res.text();
      console.log('Error response:', res.status, contentType, responseText.substring(0, 200));
      throw new Error(`${res.status}: ${responseText}`);
    }

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (res.status === 401 || res.status === 403) {
      console.log('Authentication failed, clearing tokens and redirecting to login');
      // Clear invalid token and user data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Force reload instead of just redirect
      window.location.reload();
      return null;
    }

    const data = await res.json();
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
