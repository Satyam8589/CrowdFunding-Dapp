"use client";

import { useState, useEffect } from "react";
import CampaignCard from "../../components/CampaignCard";
import Loading from "../../components/Loading";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useWallet } from "../../hooks/useWallet";
import { formatEther, calculateProgress } from "../../lib/utils";
import { PAGINATION } from "../../lib/constants";

export default function CampaignsPage() {
  const { campaigns, isLoading, error, fetchCampaigns } = useCampaigns();
  const { address, isConnected } = useWallet();
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const campaignsPerPage = PAGINATION.CAMPAIGNS_PER_PAGE;

  // Reset owner filter when wallet disconnects
  useEffect(() => {
    if (!isConnected && ownerFilter === "mine") {
      setOwnerFilter("all");
    }
  }, [isConnected, ownerFilter]);

  useEffect(() => {
    let filtered = [...campaigns];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          campaign.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const now = Math.floor(Date.now() / 1000);
      filtered = filtered.filter((campaign) => {
        const isExpired = parseInt(campaign.deadline) < now;
        const isCompleted =
          calculateProgress(campaign.amountCollected, campaign.target) >= 100;

        switch (statusFilter) {
          case "active":
            return !isExpired && !isCompleted && !campaign.withdrawn;
          case "completed":
            return isCompleted || campaign.withdrawn;
          case "expired":
            return isExpired && !campaign.withdrawn;
          default:
            return true;
        }
      });
    }

    // Owner filter (My Campaigns)
    if (ownerFilter === "mine" && address) {
      filtered = filtered.filter(
        (campaign) =>
          campaign.owner &&
          campaign.owner.toLowerCase() === address.toLowerCase()
      );
    }

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return parseInt(b.deadline) - parseInt(a.deadline);
        case "oldest":
          return parseInt(a.deadline) - parseInt(b.deadline);
        case "target_high":
          try {
            return Number(BigInt(b.target) - BigInt(a.target));
          } catch {
            return (
              parseFloat(formatEther(b.target)) -
              parseFloat(formatEther(a.target))
            );
          }
        case "target_low":
          try {
            return Number(BigInt(a.target) - BigInt(b.target));
          } catch {
            return (
              parseFloat(formatEther(a.target)) -
              parseFloat(formatEther(b.target))
            );
          }
        case "progress":
          const progressA = calculateProgress(a.amountCollected, a.target);
          const progressB = calculateProgress(b.amountCollected, b.target);
          return progressB - progressA;
        default:
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [campaigns, searchTerm, statusFilter, ownerFilter, sortBy, address]);

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const startIndex = (currentPage - 1) * campaignsPerPage;
  const endIndex = startIndex + campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section with Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1"></div>
              <div className="text-center">
                <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                  {ownerFilter === "mine" ? "My Campaigns" : "All Campaigns"}
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
              </div>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={fetchCampaigns}
                  disabled={isLoading}
                  className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <svg
                    className={`w-5 h-5 mr-2 relative z-10 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="relative z-10">
                    {isLoading ? "Refreshing..." : "Refresh"}
                  </span>
                </button>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore innovative crowdfunding campaigns and support projects
              that shape the future. Connect your wallet to discover and back
              amazing ideas.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Filters and Search - Modern Card */}
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-gradient-to-r from-white/80 to-blue-50/80 backdrop-blur-sm rounded-2xl"></div>
          <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 p-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔍 Search Campaigns
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pl-12 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm"
                  />
                  <svg
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  📊 Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm appearance-none"
                  >
                    <option value="all">All Campaigns</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="expired">Expired</option>
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              {/* Owner Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  👤 Owner
                </label>
                <div className="relative">
                  <select
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className={`w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm appearance-none ${
                      !isConnected ? "opacity-60" : ""
                    }`}
                    disabled={!isConnected}
                  >
                    <option value="all">All Campaigns</option>
                    <option value="mine" disabled={!isConnected}>
                      {isConnected
                        ? "My Campaigns"
                        : "My Campaigns (Connect Wallet)"}
                    </option>
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {!isConnected && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <svg
                      className="w-3 h-3 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Connect wallet to view your campaigns
                  </p>
                )}
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  🔄 Sort By
                </label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 bg-white/80 backdrop-blur-sm appearance-none"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="target_high">Highest Target</option>
                    <option value="target_low">Lowest Target</option>
                    <option value="progress">Most Funded</option>
                  </select>
                  <svg
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Results Count - Modern Stats */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">
                    Showing {currentCampaigns.length} of{" "}
                    {filteredCampaigns.length}{" "}
                    {ownerFilter === "mine" ? "my campaigns" : "campaigns"}
                  </span>
                </div>
                {filteredCampaigns.length > 0 && (
                  <div className="text-xs text-gray-500 bg-white/60 px-3 py-1 rounded-full">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Oops! Something went wrong
              </h3>
              <p className="text-gray-600 mb-6">
                Error loading campaigns: {error}
              </p>
              <button
                onClick={fetchCampaigns}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : currentCampaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Modern Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-3 py-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>

                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                          currentPage === page
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-110"
                            : "bg-white/80 border border-gray-200 text-gray-700 hover:bg-white hover:shadow-md"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  Next
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {ownerFilter === "mine"
                  ? "No campaigns created yet"
                  : "No campaigns found"}
              </h3>
              <p className="text-gray-600 mb-8">
                {ownerFilter === "mine"
                  ? "Start your journey by creating your first crowdfunding campaign and bring your ideas to life."
                  : searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filter criteria to find what you're looking for."
                  : "Be the pioneer! Create the first campaign and start building the future of decentralized funding."}
              </p>
              {ownerFilter === "mine" ? (
                <a
                  href="/campaigns/create"
                  className="inline-flex items-center bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
                  Create Your First Campaign
                </a>
              ) : (
                !searchTerm &&
                statusFilter === "all" && (
                  <a
                    href="/campaigns/create"
                    className="inline-flex items-center bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
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
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                    Launch the First Campaign
                  </a>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
