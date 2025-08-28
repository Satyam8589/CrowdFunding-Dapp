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
      router.push("/");
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
              Your campaign has been created and is now live. Redirecting to
              home page...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
