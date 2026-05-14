"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "sonner";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handler = (e: Event) => {
      const { type, message } = (e as CustomEvent).detail;
      import("sonner").then(({ toast }) => {
        if (type === "success") toast.success(message);
        else if (type === "error") toast.error(message);
        else toast.warning(message);
      });
    };
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            background: "rgba(10, 22, 40, 0.95)",
            border: "1px solid rgba(0, 212, 170, 0.2)",
            backdropFilter: "blur(20px)",
            color: "#fff",
          },
        }}
      />
    </QueryClientProvider>
  );
}
