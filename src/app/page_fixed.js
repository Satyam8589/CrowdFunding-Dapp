"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CampaignCard from "../components/CampaignCard";
import Loading from "../components/Loading";
import WalletConnection from "../components/WalletConnection";
import { useCampaigns } from "../hooks/useCampaigns";
import { ethers } from "ethers";

export default function Home() {
  const {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    fetchCampaignsWithRetry,
  } = useCampaigns();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before accessing window objects
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Show latest 6 campaigns on home page
    if (campaigns.length > 0) {
      setFeaturedCampaigns(campaigns.slice(-6).reverse());
    }
  }, [campaigns]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Don't render anything until client-side
  if (!isClient) {
    return null;
  }

  // Simple error state without debugging
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Unable to Load Campaigns
            </h1>
            <p className="text-gray-600 mb-6">
              We're having trouble connecting to the blockchain. Please try
              again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Loading />
            <h1 className="text-3xl font-bold text-gray-800 mt-6 mb-4">
              Loading Crowdfunding Campaigns
            </h1>
            <p className="text-gray-600">
              Fetching the latest projects from the blockchain...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Crowdfunding Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Support innovative projects and help bring dreams to life through
            blockchain-powered crowdfunding
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/campaigns/create"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Create Campaign
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Browse All Campaigns
              <svg
                className="ml-2 -mr-1 w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>

        {/* Featured Campaigns */}
        {featuredCampaigns.length > 0 ? (
          <div
            className={`transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
                Featured Campaigns
              </h2>
              <p className="text-gray-600 text-center max-w-2xl mx-auto">
                Discover amazing projects from our community. Every contribution
                makes a difference!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredCampaigns.map((campaign, index) => (
                <div
                  key={campaign.id}
                  className={`transition-all duration-700 delay-${
                    (index + 1) * 100
                  } ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <CampaignCard campaign={campaign} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No campaigns yet
              </h3>
              <p className="mt-2 text-gray-500">
                Be the first to create a campaign and start raising funds for
                your project.
              </p>
              <div className="mt-6">
                <Link
                  href="/campaigns/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Create First Campaign
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Info Cards */}
        <div
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-all duration-1000 delay-500 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Secure Funding
            </h3>
            <p className="text-gray-600 text-sm">
              All transactions are secured by blockchain technology, ensuring
              transparency and trust.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Community Driven
            </h3>
            <p className="text-gray-600 text-sm">
              Join a thriving community of innovators, creators, and supporters
              making dreams come true.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast & Efficient
            </h3>
            <p className="text-gray-600 text-sm">
              Launch your campaign in minutes and start receiving contributions
              immediately.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div
          className={`bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 mt-16 transition-all duration-1000 delay-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Bring Your Idea to Life?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of successful projects that have raised millions
              through our platform. Start your journey today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/campaigns/create"
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Start Your Campaign
              </Link>
              <Link
                href="/campaigns"
                className="inline-flex items-center px-8 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-colors"
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
