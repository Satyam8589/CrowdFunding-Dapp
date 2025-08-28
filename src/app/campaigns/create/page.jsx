"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CampaignForm from "../../../components/CampaignForm";
import NetworkRequirement from "../../../components/NetworkRequirement";
import { useNetwork } from "../../../contexts/NetworkContext";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const { switchToInteractMode } = useNetwork();

  // Switch to interact mode when component mounts
  useEffect(() => {
    switchToInteractMode();
  }, [switchToInteractMode]);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/campaigns");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create a New Campaign
            </h1>
            <p className="text-gray-600">
              Start your crowdfunding journey and bring your ideas to life.
            </p>
          </div>

          {/* Platform Fee Information */}
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
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
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  💰 Platform Fee: 1% on Withdrawal
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Good news!</strong> Creating campaigns is completely{" "}
                    <span className="text-green-600 font-semibold">free</span>.
                    We only charge a small 1% fee when you successfully withdraw
                    funds.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-green-600 font-semibold">
                        ✅ Free to Create
                      </div>
                      <div className="text-xs text-gray-600">
                        No upfront costs
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <div className="text-blue-600 font-semibold">
                        🎯 1% on Success
                      </div>
                      <div className="text-xs text-gray-600">
                        Only when you withdraw
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-3">
                    Example: If you raise 5 ETH and withdraw, you receive 4.95
                    ETH (0.05 ETH platform fee)
                  </p>
                </div>
              </div>
            </div>
          </div>

          <NetworkRequirement action="create">
            <CampaignForm onSuccess={handleSuccess} />
          </NetworkRequirement>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center shadow-xl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Campaign Created Successfully!
            </h3>
            <p className="text-gray-600 mb-4">
              Your campaign has been created and is now live on the blockchain.
              Redirecting to campaigns page...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
