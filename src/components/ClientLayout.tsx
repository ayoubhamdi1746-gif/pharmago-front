"use client";

import { useEffect } from "react";
import { Providers } from "./providers";
import ErrorBoundary from "./ErrorBoundary";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    NProgress.configure({ showSpinner: false, easing: "ease", speed: 400 });

    let lenis: InstanceType<typeof import("lenis").default> | null = null;

    import("lenis").then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 0.6,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
    }).catch(() => {});

    const handleStart = () => NProgress.start();
    const handleDone = () => NProgress.done();

    const onLinkClick = () => { NProgress.start(); };
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.closest("a[href^='/']")) onLinkClick();
    });

    return () => {
      lenis?.destroy();
    };
  }, []);

  return (
    <ErrorBoundary>
      <Providers>{children}</Providers>
    </ErrorBoundary>
  );
}