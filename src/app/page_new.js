"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CampaignCard from "../components/CampaignCard";
import Loading from "../components/Loading";
import { useCampaigns } from "../hooks/useCampaigns";

export default function Home() {
  const { campaigns, isLoading, error, fetchCampaigns } = useCampaigns();
  const [featuredCampaigns, setFeaturedCampaigns] = useState([]);

  useEffect(() => {
    // Show latest 6 campaigns on home page
    if (campaigns.length > 0) {
      setFeaturedCampaigns(campaigns.slice(-6).reverse());
    }
  }, [campaigns]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Fund Dreams with
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
              Blockchain
            </span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Join the future of crowdfunding. Create, fund, and manage campaigns
            on a transparent, decentralized platform powered by Ethereum.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/campaigns/create"
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Start a Campaign
            </Link>
            <Link
              href="/campaigns"
              className="border-2 border-white hover:bg-white hover:text-blue-600 font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              Explore Campaigns
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {campaigns.length}
              </div>
              <div className="text-gray-600">Total Campaigns</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {campaigns
                  .reduce(
                    (sum, campaign) =>
                      sum + parseFloat(campaign.amountCollected || 0),
                    0
                  )
                  .toFixed(2)}
              </div>
              <div className="text-gray-600">ETH Raised</div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-3xl font-bold text-purple-600 mb-2">1%</div>
              <div className="text-gray-600">Platform Fee</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Campaigns
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover amazing projects and help bring innovative ideas to life
              through the power of community funding.
            </p>
          </div>

          {isLoading ? (
            <Loading />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">
                Error loading campaigns: {error}
              </p>
              <button
                onClick={fetchCampaigns}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          ) : featuredCampaigns.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCampaigns.map((campaign) => (
                  <CampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/campaigns"
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                  View All Campaigns
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No campaigns available yet.</p>
              <Link
                href="/campaigns/create"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create the First Campaign
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple steps to start your crowdfunding journey on the blockchain.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Create Campaign</h3>
              <p className="text-gray-600">
                Set up your campaign with a title, description, target amount,
                and deadline.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Receive Funding</h3>
              <p className="text-gray-600">
                Share your campaign and receive ETH contributions from
                supporters worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Withdraw Funds</h3>
              <p className="text-gray-600">
                After the deadline, withdraw your raised funds (minus 1%
                platform fee).
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
