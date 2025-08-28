"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCampaigns } from "../../../hooks/useCampaigns";
import { useContract } from "../../../hooks/useContract";
import { useWallet } from "../../../hooks/useWallet";
import ContributeForm from "../../../components/ContributeForm";
import NetworkRequirement from "../../../components/NetworkRequirement";
import SmartActionButton from "../../../components/SmartActionButton";
import ExpandableAddress from "../../../components/ExpandableAddress";
import Loading from "../../../components/Loading";
import { useNetwork } from "../../../contexts/NetworkContext";
import {
  formatAddress,
  formatDate,
  calculateProgress,
  getDaysLeft,
  getCampaignStatus,
} from "../../../lib/utils";
import { getSafeImageUrl } from "../../../lib/imageUtils";

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id;
  const { getCampaignById, getDonators } = useCampaigns();
  const { withdrawFunds, isLoading: contractLoading } = useContract();
  const { address, isConnected } = useWallet();
  const { canInteract, switchToInteractMode } = useNetwork();

  const [campaign, setCampaign] = useState(null);
  const [donators, setDonators] = useState({ donators: [], donations: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const [showAllBackers, setShowAllBackers] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(4);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchCampaignData = async () => {
    try {
      setRefreshing(true);
      setError("");

      const campaignData = await getCampaignById(campaignId);
      // Always fetch donators since it's a view function that doesn't require wallet connection
      let donatorsData = { donators: [], donations: [] };
      try {
        donatorsData = await getDonators(campaignId);
        console.log("Donators data fetched:", donatorsData);
      } catch (donatorError) {
        console.log("Could not fetch donators:", donatorError);
      }

      setCampaign(campaignData);
      setDonators(donatorsData);
    } catch (err) {
      console.error("Error fetching campaign:", err);
      setError("Failed to load campaign details");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const handleWithdraw = async () => {
    if (!campaign || !isConnected) return;

    try {
      await withdrawFunds(campaignId);
      await fetchCampaignData(); // Refresh data after withdrawal
    } catch (err) {
      console.error("Failed to withdraw funds:", err);
    }
  };

  const handleContributeSuccess = async () => {
    // Add a small delay to ensure blockchain state has updated
    setTimeout(async () => {
      await fetchCampaignData(); // Refresh data after contribution
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Campaign not found"}</p>
          <button
            onClick={() => router.push("/campaigns")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back to Campaigns
          </button>
        </div>
      </div>
    );
  }

  const progress = calculateProgress(campaign.amountCollected, campaign.target);
  const daysLeft = getDaysLeft(parseInt(campaign.deadline));
  const status = getCampaignStatus(
    parseInt(campaign.deadline),
    campaign.withdrawn,
    campaign.target,
    campaign.amountCollected
  );

  // Only calculate these after component has mounted to prevent hydration mismatch
  const isOwner =
    isMounted &&
    address &&
    campaign.owner.toLowerCase() === address.toLowerCase();
  const canWithdraw =
    isOwner &&
    status === "expired" &&
    !campaign.withdrawn &&
    parseFloat(campaign.amountCollected) > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/campaigns"
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Back to Campaigns
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Campaign Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-64 md:h-80">
                {!imageError ? (
                  <Image
                    src={getSafeImageUrl(campaign.imageUrl)}
                    alt={campaign.title}
                    fill
                    className="object-cover"
                    onError={() => {
                      console.log(
                        `Image failed for campaign: ${campaign.title}`
                      );
                      setImageError(true);
                    }}
                  />
                ) : (
                  <Image
                    src="/images/campaign-placeholder.svg"
                    alt={campaign.title}
                    fill
                    className="object-cover"
                  />
                )}
                <div className="absolute top-4 right-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      status === "active"
                        ? "bg-green-100 text-green-800"
                        : status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {campaign.title}
                </h1>

                <div className="flex items-center text-sm text-gray-600 mb-6">
                  <span className="mr-4">
                    By:{" "}
                    <span className="font-medium">
                      {formatAddress(campaign.owner)}
                    </span>
                  </span>
                  <span>
                    Deadline:{" "}
                    <span className="font-medium">
                      {formatDate(parseInt(campaign.deadline))}
                    </span>
                  </span>
                </div>

                {/* Progress Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {parseFloat(campaign.amountCollected).toFixed(4)} ETH
                    </span>
                    <span className="text-sm text-gray-600">
                      raised of {parseFloat(campaign.target).toFixed(4)} ETH
                      target
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {progress.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-600">Funded</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {donators.donators.length}
                      </div>
                      <div className="text-sm text-gray-600">Backers</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {status === "expired" ? "0" : daysLeft}
                      </div>
                      <div className="text-sm text-gray-600">Days left</div>
                    </div>
                  </div>
                </div>

                {/* Owner Actions */}
                {isOwner && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Campaign Owner Actions
                    </h3>
                    {canWithdraw ? (
                      <button
                        onClick={handleWithdraw}
                        disabled={contractLoading}
                        className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        {contractLoading ? "Withdrawing..." : "Withdraw Funds"}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {campaign.withdrawn
                          ? "Funds have been withdrawn"
                          : status === "active"
                          ? "You can withdraw funds after the deadline expires"
                          : "No funds to withdraw"}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Campaign Description */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                About this Campaign
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {campaign.description}
                </p>
              </div>
            </div>

            {/* Backers List */}
            {donators.donators.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recent Backers ({donators.donators.length})
                </h2>
                <div className="space-y-3">
                  {(() => {
                    // Get the most recent donators (reverse the array to show newest first)
                    const sortedDonators = [...donators.donators].reverse();
                    const sortedDonations = [...donators.donations].reverse();

                    // Show only the display limit (4 initially)
                    const displayCount = showAllBackers
                      ? sortedDonators.length
                      : Math.min(displayLimit, sortedDonators.length);

                    return sortedDonators
                      .slice(0, displayCount)
                      .map((donator, index) => (
                        <div
                          key={`${donator}-${index}`}
                          className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <ExpandableAddress
                            address={donator}
                            className="flex-1"
                          />
                          <span className="text-sm font-semibold text-gray-900 ml-4">
                            {parseFloat(sortedDonations[index]).toFixed(4)} ETH
                          </span>
                        </div>
                      ));
                  })()}

                  {/* Load More / Show Less Button */}
                  {donators.donators.length > 3 && (
                    <div className="text-center pt-4">
                      {!showAllBackers ? (
                        <button
                          onClick={() => setShowAllBackers(true)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200 hover:underline"
                        >
                          Load More ({donators.donators.length - displayLimit}{" "}
                          more backers)
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowAllBackers(false)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors duration-200 hover:underline"
                        >
                          Show Less
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contribute Form */}
            <ContributeForm
              campaignId={campaignId}
              campaign={campaign}
              onSuccess={handleContributeSuccess}
            />

            {/* Campaign Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Campaign Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Campaign ID:</span>
                  <span className="font-mono">{campaign.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Creator:</span>
                  <ExpandableAddress
                    address={campaign.owner}
                    startChars={4}
                    endChars={4}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Target:</span>
                  <span className="font-semibold">
                    {parseFloat(campaign.target).toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raised:</span>
                  <span className="font-semibold">
                    {parseFloat(campaign.amountCollected).toFixed(4)} ETH
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span>{formatDate(parseInt(campaign.deadline))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      status === "active"
                        ? "text-green-600"
                        : status === "completed"
                        ? "text-blue-600"
                        : status === "expired"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchCampaignData}
              disabled={refreshing}
              className="w-full bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
