"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toastVariants } from "@/lib/motion";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});

interface Toast {
  id: number;
  type: "success" | "error" | "warning";
  message: string;
}

let toastId = 0;

function ToastItem({ toast }: { toast: Toast }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 4000;
    const interval = 30;
    const step = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) return 0;
        return prev - step;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [toast.id]);

  const borderColor =
    toast.type === "success"
      ? "border-primary-400"
      : toast.type === "error"
      ? "border-danger-400"
      : "border-warning-400";

  const bgColor =
    toast.type === "success"
      ? "bg-primary-400"
      : toast.type === "error"
      ? "bg-danger-500"
      : "bg-warning-500";

  const iconColor =
    toast.type === "success"
      ? "text-primary-400"
      : toast.type === "error"
      ? "text-danger-400"
      : "text-warning-400";

  return (
    <motion.div
      variants={toastVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={`glass-card px-4 py-3 max-w-xs overflow-hidden border-l-2 ${borderColor}`}
    >
      <div className="flex items-start gap-3">
        <span className={`mt-0.5 ${iconColor}`}>
          {toast.type === "success" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : toast.type === "error" ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.8-2.8L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
        </span>
        <p className="text-sm text-white flex-1">{toast.message}</p>
      </div>
      <div className="mt-2 h-0.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-[30ms] linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </motion.div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((detail: { type: Toast["type"]; message: string }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, ...detail }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => addToast((e as CustomEvent).detail);
    window.addEventListener("toast", handler);
    return () => window.removeEventListener("toast", handler);
  }, [addToast]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} />
          ))}
        </AnimatePresence>
      </div>
    </QueryClientProvider>
  );
}
