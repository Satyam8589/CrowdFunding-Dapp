"use client";

import { useState, useEffect } from "react";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";
import Loading from "./Loading";

export default function ContributeForm({ campaignId, campaign, onSuccess }) {
  const { donateToCampaign, isLoading, error } = useContract();
  const { isConnected, isCorrectNetwork, address } = useWallet();
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isOwner =
    address && campaign.owner.toLowerCase() === address.toLowerCase();
  const now = Math.floor(Date.now() / 1000);
  const isExpired = parseInt(campaign.deadline) < now;
  const isWithdrawn = campaign.withdrawn;

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setAmount(value);

    if (formError) {
      setFormError("");
    }
  };

  const validateAmount = () => {
    if (!amount || amount === "") {
      setFormError("Please enter an amount");
      return false;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError("Please enter a valid amount greater than 0");
      return false;
    }

    if (numAmount < 0.001) {
      setFormError("Minimum contribution is 0.001 ETH");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateAmount()) return;

    try {
      await donateToCampaign(campaignId, amount);

      // Store the donated amount and show thank you popup
      setDonatedAmount(amount);
      setShowThankYou(true);

      // Hide popup after 1 second
      setTimeout(() => {
        setShowThankYou(false);
      }, 1000);

      setAmount("");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Failed to contribute:", err);
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return <Loading />;
  }

  if (!isConnected) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-4">
          Connect your wallet to contribute to this campaign
        </p>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">
          Please switch to the correct network to contribute
        </p>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <p className="text-blue-700">
          You cannot contribute to your own campaign
        </p>
      </div>
    );
  }

  if (isExpired || isWithdrawn) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-600">
          This campaign has{" "}
          {isWithdrawn ? "ended and funds have been withdrawn" : "expired"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Contribute to this Campaign
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Amount (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={handleAmountChange}
                placeholder="0.001"
                step="0.001"
                min="0.001"
                className={`w-full border rounded-lg px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formError ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">
                ETH
              </span>
            </div>
            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}
          </div>

          {/* Quick amount buttons */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
            <div className="grid grid-cols-4 gap-2">
              {[0.01, 0.05, 0.1, 0.5].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isLoading}
                >
                  {quickAmount} ETH
                </button>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !amount}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Contributing...
              </div>
            ) : (
              `Contribute ${amount || "0"} ETH`
            )}
          </button>

          {/* Fee Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-xs">
              Your contribution will be sent directly to the campaign. The
              campaign creator can withdraw funds after the deadline (with a 1%
              platform fee).
            </p>
          </div>
        </form>
      </div>

      {/* Thank You Popup */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-slideUp border-2 border-green-200">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
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
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Thank You! 🎉
            </h3>
            <p className="text-gray-600 mb-1">Your contribution of</p>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-500 mb-3">
              {donatedAmount} ETH
            </p>
            <p className="text-gray-600 text-sm">
              has been successfully donated!
            </p>
            <div className="mt-4">
              <div className="w-12 h-1 bg-gradient-to-r from-green-400 to-green-500 rounded-full mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
