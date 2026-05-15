import type { Metadata } from "next";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaGo — La livraison médicale sécurisée en Tunisie",
  description: "Ordonnances vérifiées, chiffrement bout-en-bout, livreurs certifiés. Le premier SaaS de livraison médicale tunisien. Pharmacie en ligne, livraison médicaments Tunis.",
  keywords: "pharmacie tunisie, livraison médicaments, ordonnance en ligne, pharmacie tunis, livraison médicale, prescription électronique, SaaS pharmaceutique, PharmaGo",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "PharmaGo — La livraison médicale sécurisée en Tunisie",
    description: "Ordonnances vérifiées par des pharmaciens agréés. Chiffrement bout-en-bout. Livreurs certifiés. Le premier SaaS de livraison médicale tunisien.",
    url: "https://pharmago-front.vercel.app",
    siteName: "PharmaGo",
    type: "website",
    locale: "fr_TN",
  },
  twitter: {
    card: "summary_large_image",
    title: "PharmaGo — Livraison médicale sécurisée 🇹🇳",
    description: "La solution N°1 pour les pharmacies tunisiennes. Ordonnances vérifiées, livraison sécurisée.",
  },
  robots: { index: true, follow: true },
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
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}