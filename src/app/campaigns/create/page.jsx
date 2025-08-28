"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CampaignForm from "../../../components/CampaignForm";

export default function CreateCampaignPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/campaigns");
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Campaign Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your campaign has been published on the blockchain.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to campaigns page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Create New Campaign
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Launch your crowdfunding campaign on the blockchain. Fill in the
            details below to get started.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-3">
            Before you start:
          </h3>
          <ul className="text-blue-800 text-sm space-y-2">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Make sure your wallet is connected and you're on the correct
              network
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Have some ETH for transaction fees (gas costs)
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Prepare a compelling title, description, and image for your
              campaign
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Set a realistic funding target and deadline
            </li>
          </ul>
        </div>

        {/* Campaign Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <CampaignForm onSuccess={handleSuccess} />
        </div>

        {/* Additional Info */}
        <div className="mt-8 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="font-semibold text-gray-900 mb-4">How it works:</h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white font-bold text-sm">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    Create Your Campaign
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Fill out the form with your campaign details and submit the
                    transaction.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Share & Promote</h4>
                  <p className="text-gray-600 text-sm">
                    Share your campaign link to attract supporters and reach
                    your funding goal.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-4 mt-1">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Withdraw Funds</h4>
                  <p className="text-gray-600 text-sm">
                    After your deadline, withdraw the raised funds (minus 1%
                    platform fee).
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="font-semibold text-yellow-900 mb-2">
              Important Notes:
            </h3>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>• Once created, campaign details cannot be modified</li>
              <li>
                • Funds can only be withdrawn by the campaign creator after the
                deadline
              </li>
              <li>
                • All transactions are recorded on the blockchain and are
                publicly visible
              </li>
              <li>• A 1% platform fee is deducted from withdrawn funds</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
