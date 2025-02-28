import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

/**
 * Enhanced API request function with better error handling and retries
 */
export async function apiRequest<T = any>({
  method,
  path,
  data,
  retries = 1,
  retryDelay = 300
}: {
  method: string;
  path: string;
  data?: unknown | undefined;
  retries?: number;
  retryDelay?: number;
}): Promise<T> {
  let lastError: Error | null = null;
  
  // Try multiple times if specified
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Add a small random delay between retries to prevent flooding
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * attempt + Math.random() * 100));
      }
      
      // Make the actual request
      const res = await fetch(path, {
        method,
        headers: data ? { "Content-Type": "application/json" } : {},
        body: data ? JSON.stringify(data) : undefined,
        credentials: "include",
      });
      
      // Check if the response is OK
      if (!res.ok) {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
      
      // Parse and return the JSON response
      return await res.json() as T;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.error(`API request attempt ${attempt + 1}/${retries + 1} failed:`, lastError);
      
      // On the last attempt, we'll throw the error
      if (attempt === retries) {
        throw lastError;
      }
    }
  }
  
  // This should never be reached, but TypeScript needs it
  throw lastError || new Error('Unknown error occurred during API request');
}

type UnauthorizedBehavior = "returnNull" | "throw";

/**
 * Enhanced query function with better error handling and retries
 */
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
  retries?: number;
  retryDelay?: number;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior, retries = 1, retryDelay = 300 }) =>
  async ({ queryKey }) => {
    let lastError: Error | null = null;
    
    // Try multiple times if specified
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add a small random delay between retries to prevent flooding
        if (attempt > 0) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt + Math.random() * 100));
          console.info(`Retrying API request attempt ${attempt}/${retries}...`);
        }
        
        // Make the request
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        // Handle 401 Unauthorized based on specified behavior
        if (unauthorizedBehavior === "returnNull" && res.status === 401) {
          return null;
        }
        
        // Handle non-OK responses
        if (!res.ok) {
          const text = (await res.text()) || res.statusText;
          throw new Error(`${res.status}: ${text}`);
        }
        
        // Parse and return the JSON response
        return await res.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Query attempt ${attempt + 1}/${retries + 1} failed:`, lastError);
        
        // On the last attempt, we'll throw the error
        if (attempt === retries) {
          throw lastError;
        }
      }
    }
    
    // This should never be reached, but TypeScript needs it
    throw lastError || new Error('Unknown error occurred during query');
  };

/**
 * Configured Query Client with enhanced error handling and retry logic
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ 
        on401: "throw",
        retries: 2,
        retryDelay: 500
      }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false, // We handle retries in our custom queryFn
    },
    mutations: {
      retry: false, // We handle retries in our custom mutation function
    },
  },
});
