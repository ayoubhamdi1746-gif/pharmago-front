import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import ErrorBoundary from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaGo — Plateforme de livraison de médicaments en Tunisie",
  description: "Sécurisez, vérifiez et livrez des ordonnances médicales en toute confiance. La solution N°1 pour les pharmacies tunisiennes.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PharmaGo — Plateforme de livraison de médicaments en Tunisie",
    description: "Sécurisez, vérifiez et livrez des ordonnances médicales en toute confiance. La solution N°1 pour les pharmacies tunisiennes.",
    url: "https://pharmago-front.vercel.app",
    siteName: "PharmaGo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PharmaGo — Plateforme de livraison de médicaments en Tunisie",
    description: "Sécurisez, vérifiez et livrez des ordonnances médicales en toute confiance. La solution N°1 pour les pharmacies tunisiennes.",
  },
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