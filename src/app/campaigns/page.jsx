"use client";

import { useState, useEffect } from "react";
import CampaignCard from "../../components/CampaignCard";
import Loading from "../../components/Loading";
import { useCampaigns } from "../../hooks/useCampaigns";
import { PAGINATION } from "../../lib/constants";

export default function CampaignsPage() {
  const { campaigns, isLoading, error, fetchCampaigns } = useCampaigns();
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const campaignsPerPage = PAGINATION.CAMPAIGNS_PER_PAGE;

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
          parseFloat(campaign.amountCollected) >= parseFloat(campaign.target);

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

    // Sort campaigns
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "latest":
          return parseInt(b.deadline) - parseInt(a.deadline);
        case "oldest":
          return parseInt(a.deadline) - parseInt(b.deadline);
        case "target_high":
          return parseFloat(b.target) - parseFloat(a.target);
        case "target_low":
          return parseFloat(a.target) - parseFloat(b.target);
        case "progress":
          const progressA =
            (parseFloat(a.amountCollected) / parseFloat(a.target)) * 100;
          const progressB =
            (parseFloat(b.amountCollected) / parseFloat(b.target)) * 100;
          return progressB - progressA;
        default:
          return 0;
      }
    });

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [campaigns, searchTerm, statusFilter, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const startIndex = (currentPage - 1) * campaignsPerPage;
  const endIndex = startIndex + campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            All Campaigns
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore all active crowdfunding campaigns and support projects that
            matter to you.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Campaigns
              </label>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Campaigns</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="latest">Latest</option>
                <option value="oldest">Oldest</option>
                <option value="target_high">Highest Target</option>
                <option value="target_low">Lowest Target</option>
                <option value="progress">Most Funded</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Showing {currentCampaigns.length} of {filteredCampaigns.length}{" "}
                campaigns
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
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
        ) : currentCampaigns.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {currentCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border ${
                        currentPage === page
                          ? "bg-blue-500 text-white border-blue-500"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "No campaigns match your filters."
                : "No campaigns available yet."}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <a
                href="/campaigns/create"
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Create the First Campaign
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
