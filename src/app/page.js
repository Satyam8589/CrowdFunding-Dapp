"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CampaignCard from "../components/CampaignCard";
import CampaignStats from "../components/CampaignStats";
import Loading from "../components/Loading";
import SmartActionButton from "../components/SmartActionButton";
import { useNetwork } from "../contexts/NetworkContext";
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
  const { canInteract, isWalletConnected, needsNetworkSwitch } = useNetwork();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [showDebugger, setShowDebugger] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    // Show latest 3 campaigns on home page
    if (campaigns.length > 0) {
      setFeaturedCampaigns(campaigns.slice(-3).reverse());
    }
  }, [campaigns]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Show debugger if there's a contract error
  useEffect(() => {
    if (error && error.includes("could not decode result data")) {
      setShowDebugger(true);
    }
  }, [error]);

  const handleRetry = async () => {
    try {
      await fetchCampaignsWithRetry(3);
    } catch (retryError) {
      console.error("Retry failed:", retryError);
    }
  };

  // Don't render until client-side mounted to prevent hydration mismatches
  if (!isClient) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Loading />
        </div>
      </div>
    );
  }

  // Create gentle notices for network/contract issues without blocking browsing
  const hasNetworkNotice =
    error && (error.includes("Wrong network") || needsNetworkSwitch);
  const hasContractIssue = error && error.includes("Contract");

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Gentle Network Notice - Only shown when there are actual issues */}
      {(hasNetworkNotice || hasContractIssue) && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-blue-800 text-sm">
                {hasNetworkNotice
                  ? "⚠️ Switch to Sepolia network to interact with campaigns"
                  : "ℹ️ Some features may be limited due to connection issues"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {hasNetworkNotice ? (
                <SmartActionButton
                  action="network"
                  className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1 rounded"
                  requiresInteraction={true}
                >
                  Switch Network
                </SmartActionButton>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white py-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div
          className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transform transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Fund Dreams with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-gradient-x bg-300% animate-pulse">
              Blockchain
            </span>
          </h1>
          <p
            className={`text-xl md:text-2xl mb-8 max-w-3xl mx-auto transform transition-all duration-1000 delay-300 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            Join the future of crowdfunding. Create, fund, and manage campaigns
            on a transparent, decentralized platform powered by Ethereum.
          </p>
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-5 opacity-0"
            }`}
          >
            <SmartActionButton
              action="create"
              onClick={() => (window.location.href = "/campaigns/create")}
              className="group bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:-translate-y-1"
              requiresInteraction={true}
            >
              <span className="flex items-center justify-center">
                Start a Campaign
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
              </span>
            </SmartActionButton>
            <Link
              href="/campaigns"
              className="group border-2 border-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm"
            >
              <span className="flex items-center justify-center">
                Explore Campaigns
                <svg
                  className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Platform Fee Notice */}
      <section className="py-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold">
                Transparent Fee Structure
              </h3>
            </div>
            <div className="max-w-4xl mx-auto">
              <p className="text-lg md:text-xl mb-6 leading-relaxed">
                Our platform operates with a{" "}
                <span className="font-bold text-yellow-300 text-2xl">
                  1% platform fee
                </span>
                deducted only when campaign creators withdraw their funds after
                successful funding.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    1%
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Platform Fee
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Only on withdrawal
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    0%
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Donation Fee
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Support projects freely
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    100%
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    Transparency
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    All transactions on-chain
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-white rounded-xl shadow-lg">
                <p className="text-sm text-center text-gray-800">
                  <strong>Example:</strong> If you raise 10 ETH and withdraw,
                  you receive 9.9 ETH (0.1 ETH platform fee helps maintain our
                  services)
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CampaignStats />
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-12 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Featured Campaigns
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Discover amazing projects and help bring innovative ideas to life
              through the power of community funding.
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loading />
            </div>
          ) : error ? (
            <div className="text-center py-12 animate-fade-in">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
                <svg
                  className="w-16 h-16 text-red-400 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 mb-6 font-medium">
                  Error loading campaigns: {error}
                </p>
                <button
                  onClick={fetchCampaigns}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCampaigns.map((campaign, index) => (
                  <div
                    key={campaign.id}
                    className={`transform transition-all duration-500 ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-10 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                  >
                    <CampaignCard campaign={campaign} />
                  </div>
                ))}
              </div>
              <div
                className={`text-center mt-12 transform transition-all duration-1000 delay-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-5 opacity-0"
                }`}
              >
                <Link
                  href="/campaigns"
                  className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl hover:-translate-y-1 inline-flex items-center"
                >
                  View All Campaigns
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300"
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
            </>
          ) : (
            <div className="text-center py-12 animate-fade-in">
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 max-w-lg mx-auto">
                <svg
                  className="w-20 h-20 text-gray-400 mx-auto mb-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <p className="text-gray-600 mb-6 text-lg">
                  No campaigns available yet.
                </p>
                <Link
                  href="/campaigns/create"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create the First Campaign
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`text-center mb-16 transform transition-all duration-1000 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-10 opacity-0"
            }`}
          >
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Simple steps to start your crowdfunding journey on the blockchain.
            </p>
            <div className="mt-6 w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Create Campaign",
                description:
                  "Set up your campaign with a title, description, target amount, and deadline.",
                color: "from-blue-500 to-blue-600",
                icon: "M12 6v6m0 0v6m0-6h6m-6 0H6",
              },
              {
                step: 2,
                title: "Receive Funding",
                description:
                  "Share your campaign and receive ETH contributions from supporters worldwide.",
                color: "from-green-500 to-green-600",
                icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
              },
              {
                step: 3,
                title: "Withdraw Funds",
                description:
                  "After the deadline, withdraw your raised funds (minus 1% platform fee).",
                color: "from-purple-500 to-purple-600",
                icon: "M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`group text-center transform transition-all duration-700 ${
                  isVisible
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <div className="relative mb-8">
                  <div
                    className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mx-auto shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2`}
                  >
                    <svg
                      className="w-10 h-10 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-700">
                      {item.step}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-xl mb-4 text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .bg-300% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  );
}
