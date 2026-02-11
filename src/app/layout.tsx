import type { Metadata } from "next";
import { Inter, Orbitron } from "next/font/google";
import { Providers } from "@/components/providers";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { IdentityVerificationStatusChecker } from "@/components/identity-verification-status-checker";
import { cn } from "@/lib/utils";
import CookieBanner from "@/components/cookie-banner";
import "./globals.css";

// Ottimizzazione font loading
const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-sans",
  display: 'swap',
  preload: true,
});

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: "--font-display",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "EVENTRY - Event Management System",
  description: "Sistema completo di gestione eventi con check-in digitale e liste PR",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "EVENTRY",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch per domini esterni */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        
        {/* Preconnect per risorse critiche */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          inter.variable,
          orbitron.variable
        )}
      >
        <Providers>
          <PerformanceMonitor />
          <IdentityVerificationStatusChecker />
          {children}
          <CookieBanner />
        </Providers>
      </body>
    </html>
  );
}