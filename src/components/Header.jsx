"use client";

import { useState } from "react";
import Link from "next/link";
import ConnectWallet from "./ConnectWallet";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-to-r from-white via-blue-50 to-purple-50 backdrop-blur-lg border-b border-white/20 shadow-xl relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-4 -left-4 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-between items-center h-20">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                CrowdFund
              </span>
              <span className="text-xs text-gray-500 font-medium -mt-1">
                Decentralized Platform
              </span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link
              href="/"
              className="group relative px-4 py-2 rounded-xl text-gray-700 hover:text-blue-700 transition-all duration-300 hover:bg-white/50 hover:backdrop-blur-sm"
            >
              <span className="relative z-10 font-medium">🏠 Home</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/campaigns"
              className="group relative px-4 py-2 rounded-xl text-gray-700 hover:text-blue-700 transition-all duration-300 hover:bg-white/50 hover:backdrop-blur-sm"
            >
              <span className="relative z-10 font-medium">
                📋 All Campaigns
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/campaigns/create"
              className="group relative px-4 py-2 rounded-xl text-gray-700 hover:text-blue-700 transition-all duration-300 hover:bg-white/50 hover:backdrop-blur-sm"
            >
              <span className="relative z-10 font-medium">
                ✨ Create Campaign
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/about"
              className="group relative px-4 py-2 rounded-xl text-gray-700 hover:text-blue-700 transition-all duration-300 hover:bg-white/50 hover:backdrop-blur-sm"
            >
              <span className="relative z-10 font-medium">ℹ️ About</span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </nav>

          {/* Enhanced Desktop Wallet Connection */}
          <div className="hidden md:block">
            <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-2xl p-1 border border-white/30 shadow-lg">
              <ConnectWallet />
            </div>
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="relative p-3 text-gray-700 hover:text-blue-600 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-110"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="w-6 h-6 transform transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-500 ease-out overflow-hidden ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="px-2 pt-4 pb-6 space-y-2 bg-gradient-to-r from-white/90 to-white/70 backdrop-blur-lg border-t border-white/30 rounded-b-2xl shadow-lg relative">
            {/* Mobile menu background decoration */}
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>

            <Link
              href="/"
              onClick={closeMobileMenu}
              className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 bg-white/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <span className="text-xl">🏠</span>
              <span className="font-medium">Home</span>
            </Link>
            <Link
              href="/campaigns"
              onClick={closeMobileMenu}
              className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 bg-white/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <span className="text-xl">📋</span>
              <span className="font-medium">All Campaigns</span>
            </Link>
            <Link
              href="/campaigns/create"
              onClick={closeMobileMenu}
              className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 bg-white/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <span className="text-xl">✨</span>
              <span className="font-medium">Create Campaign</span>
            </Link>
            <Link
              href="/about"
              onClick={closeMobileMenu}
              className="group flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 bg-white/50 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md"
            >
              <span className="text-xl">ℹ️</span>
              <span className="font-medium">About</span>
            </Link>
            <div className="px-4 py-3">
              <div className="bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm rounded-xl p-2 border border-white/30 shadow-md">
                <ConnectWallet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
