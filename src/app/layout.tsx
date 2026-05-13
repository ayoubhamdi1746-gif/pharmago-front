import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaGo",
  description: "Pharmacy Delivery Management System",
  icons: { icon: "/logo.svg" },
  other: {
    "google-fonts": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+Arabic:wght@400;500;600&display=swap",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Sans+Arabic:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
