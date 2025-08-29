"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../../config/wagmi";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ErrorBoundary from "../components/ErrorBoundary";
import NetworkProvider from "../contexts/NetworkContext";
import InstallPWA from "../components/InstallPWA";
import "./globals.css";
import { useState, useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Create QueryClient outside component to prevent recreation on re-renders
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

export default function RootLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Register service worker for PWA
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registration successful:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Prevent hydration mismatch by not rendering dynamic content until mounted
  if (!isMounted) {
    return (
      <html lang="en">
        <head>
          <title>CrowdFund - Decentralized Crowdfunding Platform</title>
          <meta
            name="description"
            content="A decentralized crowdfunding platform built on Ethereum blockchain"
          />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="theme-color" content="#3b82f6" />
          
          {/* Favicon and Icons */}
          <link rel="icon" href="/icons/logo.svg" type="image/svg+xml" />
          <link rel="icon" href="/icons/logo_circle.png" type="image/png" />
          <link rel="apple-touch-icon" href="/icons/logo_circle.png" />
          
          {/* PWA Manifest */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* PWA Meta Tags */}
          <meta name="application-name" content="CrowdFund" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="CrowdFund" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="msapplication-TileColor" content="#3b82f6" />
          <meta name="msapplication-tap-highlight" content="no" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50`}
        >
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <head>
        <title>CrowdFund - Decentralized Crowdfunding Platform</title>
        <meta
          name="description"
          content="A decentralized crowdfunding platform built on Ethereum blockchain"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* Favicon and Icons */}
        <link rel="icon" href="/icons/logo.svg" type="image/svg+xml" />
        <link rel="icon" href="/icons/logo_circle.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/logo_circle.png" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* PWA Meta Tags */}
        <meta name="application-name" content="CrowdFund" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CrowdFund" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50`}
      >
        <ErrorBoundary>
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <NetworkProvider>
                <Header />
                <main className="flex-1 relative">
                  {/* Background decorative elements */}
                  <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-400/5 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/5 to-pink-400/5 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/3 to-purple-400/3 rounded-full blur-3xl"></div>
                  </div>
                  <div className="relative z-10">{children}</div>
                </main>
                <Footer />
                <InstallPWA />
              </NetworkProvider>
            </QueryClientProvider>
          </WagmiProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
