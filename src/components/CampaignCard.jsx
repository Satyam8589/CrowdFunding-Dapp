"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  formatEther,
  formatDate,
  calculateProgress,
  getDaysLeft,
  getCampaignStatus,
} from "../lib/utils";
import { getSafeImageUrl } from "../lib/imageUtils";

export default function CampaignCard({ campaign }) {
  const progress = calculateProgress(campaign.amountCollected, campaign.target);
  console.log("CampaignCard Debug:", {
    collected: campaign.amountCollected,
    target: campaign.target,
    progress: progress,
    progressType: typeof progress,
  });
  const daysLeft = getDaysLeft(parseInt(campaign.deadline));
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const status = getCampaignStatus(
    parseInt(campaign.deadline),
    campaign.withdrawn,
    campaign.target,
    campaign.amountCollected
  );

  const getStatusStyles = () => {
    switch (status) {
      case "active":
        return {
          bg: "bg-emerald-50 border-emerald-200",
          text: "text-emerald-700",
          dot: "bg-emerald-500",
        };
      case "completed":
        return {
          bg: "bg-blue-50 border-blue-200",
          text: "text-blue-700",
          dot: "bg-blue-500",
        };
      case "expired":
        return {
          bg: "bg-red-50 border-red-200",
          text: "text-red-700",
          dot: "bg-red-500",
        };
      case "withdrawn":
        return {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-700",
          dot: "bg-gray-500",
        };
      default:
        return {
          bg: "bg-gray-50 border-gray-200",
          text: "text-gray-700",
          dot: "bg-gray-500",
        };
    }
  };

  const getProgressColor = () => {
    if (progress >= 100) return "bg-emerald-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-amber-500";
    return "bg-orange-500";
  };

  const statusStyles = getStatusStyles();

  return (
    <div className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {!imageError ? (
          <>
            <Image
              src={getSafeImageUrl(campaign.imageUrl)}
              alt={campaign.title || "Campaign image"}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                console.log(`Image failed for campaign: ${campaign.title}`);
                setImageError(true);
              }}
              priority={false}
            />
            {/* Loading skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusStyles.bg} ${statusStyles.text} backdrop-blur-sm`}
          >
            <div
              className={`w-2 h-2 ${statusStyles.dot} rounded-full mr-2`}
            ></div>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {/* Title */}
        <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
          {campaign.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
          {campaign.description}
        </p>

        {/* Progress Section */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-gray-900">
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getProgressColor()} h-2 rounded-full transition-all duration-700 ease-out`}
              style={{
                width: `${Math.min(
                  Math.max(progress > 0 ? Math.max(progress, 0.5) : 0, 0),
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">Raised</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatEther(campaign.amountCollected)} ETH
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-xs font-medium text-gray-500 mb-1">Target</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatEther(campaign.target)} ETH
            </div>
          </div>
        </div>

        {/* Time Information */}
        <div className="flex items-center justify-between mb-5 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-400 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs font-medium text-gray-500">
              {status === "expired" ? "Ended" : "Time left"}
            </span>
          </div>
          <div className="text-sm font-semibold text-gray-900">
            {status === "expired"
              ? formatDate(parseInt(campaign.deadline))
              : `${daysLeft} days`}
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={`/campaigns/${campaign.id}`}
          className="group/btn w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-all duration-200"
        >
          View Campaign Details
          <svg
            className="ml-2 -mr-1 w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform duration-200"
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

      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
