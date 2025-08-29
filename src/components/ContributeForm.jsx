"use client";

import { useState, useEffect } from "react";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";
import { useNetwork } from "../contexts/NetworkContext";
import NetworkRequirement from "./NetworkRequirement";
import ConnectWallet from "./ConnectWallet";
import Loading from "./Loading";

export default function ContributeForm({ campaignId, campaign, onSuccess }) {
  const {
    donateToCampaign,
    isLoading: contractLoading,
    error: contractError,
  } = useContract();
  const { isConnected, isCorrectNetwork, address } = useWallet();
  const { canInteract, switchToInteractMode } = useNetwork();
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [donatedAmount, setDonatedAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clear form error when contract error changes (useful for mobile wallet reconnection)
  useEffect(() => {
    if (
      contractError &&
      contractError.includes("Contract initialization failed")
    ) {
      setFormError(
        "Wallet connection issue detected. Please try refreshing the page or reconnecting your wallet."
      );
    }
  }, [contractError]);

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
      setIsSubmitting(true);
      setFormError(""); // Clear any previous errors

      // Ensure amount is clean before passing to contract
      const cleanAmount = amount.toString().trim();

      console.log("ContributeForm submitting:", {
        campaignId,
        amount,
        cleanAmount,
        amountType: typeof amount,
      });

      await donateToCampaign(campaignId, cleanAmount);

      // Store the donated amount and show thank you popup
      setDonatedAmount(cleanAmount);
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
      // Check if user rejected the transaction
      const errorMessage = err.message || err.toString() || "";
      const isUserRejection =
        errorMessage.includes("User rejected") ||
        errorMessage.includes("user rejected") ||
        errorMessage.includes("User denied") ||
        errorMessage.includes("user denied") ||
        errorMessage.includes("Transaction was rejected") ||
        errorMessage.includes("transaction was rejected") ||
        errorMessage.includes("MetaMask Tx Signature: User denied") ||
        errorMessage.includes("User cancelled") ||
        errorMessage.includes("user cancelled") ||
        err.code === 4001 || // MetaMask rejection code
        err.code === "ACTION_REJECTED"; // ethers.js rejection code

      // Check for mobile wallet specific issues
      const isMobileWalletIssue =
        errorMessage.includes("Contract not initialized") ||
        errorMessage.includes("Unable to initialize contract") ||
        errorMessage.includes("Wallet not connected");

      if (isUserRejection) {
        // Show cancellation popup
        setShowCancelled(true);

        // Hide popup after 2 seconds
        setTimeout(() => {
          setShowCancelled(false);
        }, 2000);

        // Clear any form errors since this isn't a real error
        setFormError("");
      } else if (isMobileWalletIssue) {
        // Handle mobile wallet connection issues with helpful message
        console.error("Mobile wallet connection issue:", err);
        setFormError(
          "Wallet connection issue. Please ensure your wallet app is open and connected, then try again. If the problem persists, try refreshing the page."
        );
      } else {
        // Only log actual errors, not user rejections
        console.error("Failed to contribute:", err);

        // Set a user-friendly error message for actual errors
        setFormError(
          errorMessage || "Failed to process contribution. Please try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return <Loading />;
  }

  if (!isConnected) {
    return (
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6">
            🚀 Contribute to this Campaign
          </h3>

          <div className="text-center py-8 relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
                Wallet Connection Required
              </h4>
              <p className="text-gray-600 mb-8 leading-relaxed">
                To fund this campaign, please connect your wallet first. This
                ensures secure and transparent donations directly to the
                campaign creator.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <ConnectWallet />
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                <span className="text-xl">🔒</span>
                <span>
                  Your wallet will be used to securely send ETH directly to the
                  campaign
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="bg-gradient-to-br from-white via-orange-50 to-red-50 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-red-400/20 to-pink-400/20 rounded-full blur-xl"></div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-orange-900 to-red-900 bg-clip-text text-transparent mb-6">
            ⚠️ Network Switch Required
          </h3>

          <div className="text-center py-8 relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-orange-900 to-red-700 bg-clip-text text-transparent mb-3">
                Wrong Network Detected
              </h4>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Please switch to the Sepolia testnet to contribute to this
                campaign. This ensures your transaction is processed on the
                correct blockchain.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <ConnectWallet />
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 backdrop-blur-sm border border-white/30">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                <span className="text-xl">⚡</span>
                <span>
                  This DApp only works on Sepolia testnet for security
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isOwner) {
    return (
      <div className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-xl"></div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent mb-6">
            👑 Campaign Owner Panel
          </h3>

          <div className="text-center py-8 relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent mb-3">
                You Own This Campaign
              </h4>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Campaign creators cannot contribute to their own campaigns to
                ensure transparency and fairness in the funding process.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-6 backdrop-blur-sm border border-white/30">
              <div className="flex items-center justify-center space-x-3 text-blue-700">
                <span className="text-2xl">💡</span>
                <div className="text-left">
                  <div className="font-semibold">Share your campaign!</div>
                  <div className="text-sm text-blue-600">
                    Get more contributors by sharing with your network
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired || isWithdrawn) {
    return (
      <div className="bg-gradient-to-br from-white via-gray-50 to-slate-50 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="relative">
          <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-gray-400/20 to-slate-400/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-slate-400/20 to-gray-400/20 rounded-full blur-xl"></div>

          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-slate-700 to-gray-800 bg-clip-text text-transparent mb-6">
            {isWithdrawn ? "🎯 Campaign Completed" : "⏰ Campaign Expired"}
          </h3>

          <div className="text-center py-8 relative z-10">
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-slate-700 bg-clip-text text-transparent mb-3">
                Campaign{" "}
                {isWithdrawn ? "Successfully Completed" : "Has Expired"}
              </h4>
              <p className="text-gray-600 mb-8 leading-relaxed">
                This campaign has{" "}
                {isWithdrawn
                  ? "ended successfully and funds have been withdrawn by the creator"
                  : "expired and is no longer accepting contributions"}
                .
              </p>
            </div>

            <div
              className={`bg-gradient-to-r ${
                isWithdrawn
                  ? "from-green-100 to-emerald-100 border-green-200"
                  : "from-gray-100 to-slate-100 border-gray-200"
              } rounded-xl p-6 backdrop-blur-sm border`}
            >
              <div
                className={`flex items-center justify-center space-x-3 ${
                  isWithdrawn ? "text-green-700" : "text-gray-600"
                }`}
              >
                <span className="text-2xl">{isWithdrawn ? "✅" : "⏰"}</span>
                <div className="text-center">
                  <div className="font-semibold">
                    {isWithdrawn
                      ? "Funds Successfully Withdrawn"
                      : "Deadline Has Passed"}
                  </div>
                  <div className="text-sm opacity-75">
                    {isWithdrawn
                      ? "The campaign creator has received the funds"
                      : "No more contributions can be made"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-white via-blue-50 to-purple-50 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-2xl"></div>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-6 flex items-center">
            <span className="mr-3 text-3xl">💎</span>
            Contribute to this Campaign
          </h3>

          <NetworkRequirement action="fund">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Input */}
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-semibold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent mb-3"
                >
                  💰 Amount (ETH)
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="0.001"
                    step="0.001"
                    min="0.001"
                    className={`w-full bg-white/80 backdrop-blur-sm border-2 rounded-xl px-4 py-4 pr-16 text-lg font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl ${
                      formError
                        ? "border-red-400 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                    disabled={contractLoading || isSubmitting}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                    ETH
                  </div>
                </div>
                {formError && (
                  <div className="mt-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm font-medium flex items-center">
                      <span className="mr-2">⚠️</span>
                      {formError}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick amount buttons */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">⚡</span>
                  Quick amounts:
                </p>
                <div className="grid grid-cols-4 gap-3">
                  {[0.01, 0.05, 0.1, 0.5].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => setAmount(quickAmount.toString())}
                      className="group relative px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-2 border-gray-200 rounded-xl hover:from-blue-50 hover:to-purple-50 hover:border-blue-300 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      disabled={contractLoading || isSubmitting}
                    >
                      <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-700">
                        {quickAmount}
                      </span>
                      <span className="text-xs text-gray-500 group-hover:text-blue-500 block">
                        ETH
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Display */}
              {(formError || contractError) && (
                <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-xl p-4 shadow-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-red-500 text-xl">🚨</span>
                    <p className="text-red-700 font-medium">
                      {formError || contractError}
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={contractLoading || isSubmitting || !amount}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:transform-none disabled:hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/30"
              >
                {contractLoading || isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    <span className="text-lg">
                      {contractLoading ? "Initializing..." : "Contributing..."}
                    </span>
                  </div>
                ) : (
                  <span className="text-lg flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    Contribute {amount || "0"} ETH
                  </span>
                )}
              </button>

              {/* Fee Notice */}
              <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border-2 border-blue-200/50 rounded-xl p-5 shadow-lg backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
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
                    </div>
                  </div>
                  <div>
                    <p className="text-blue-900 font-bold mb-2 flex items-center">
                      <span className="mr-2">💰</span>
                      Platform Fee: 1% (deducted on withdrawal)
                    </p>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Your full contribution goes directly to the campaign. The
                      creator pays a 1% fee only when withdrawing funds, helping
                      maintain our decentralized platform.
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </NetworkRequirement>
        </div>
      </div>

      {/* Thank You Popup */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white via-green-50 to-emerald-50 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-slideUp border-2 border-green-200/50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-emerald-400/20 to-green-400/20 rounded-full blur-xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-green-800 bg-clip-text text-transparent mb-3">
                Thank You! 🎉
              </h3>
              <p className="text-gray-600 mb-2 text-sm">Your contribution of</p>
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 mb-4 border border-green-200">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  {donatedAmount} ETH
                </p>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                has been successfully donated!
              </p>
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Cancelled Popup */}
      {showCancelled && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-gradient-to-br from-white via-orange-50 to-red-50 rounded-3xl p-8 max-w-sm mx-4 text-center shadow-2xl animate-slideUp border-2 border-orange-200/50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gradient-to-br from-red-400/20 to-orange-400/20 rounded-full blur-xl"></div>

            <div className="relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-orange-800 bg-clip-text text-transparent mb-3">
                Funding Cancelled 🚫
              </h3>
              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-4 mb-4 border border-orange-200">
                <p className="text-gray-700 text-sm font-medium">
                  Transaction was cancelled
                </p>
              </div>
              <p className="text-gray-600 text-sm mb-6">
                No funds were transferred. You can try again anytime!
              </p>
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-orange-400 to-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            backdrop-filter: blur(0px);
          }
          to {
            opacity: 1;
            backdrop-filter: blur(8px);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }

        .animate-shimmer {
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255, 255, 255, 0.4) 50%,
            transparent 100%
          );
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }

        /* Glass morphism effect */
        .glass {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.18);
        }

        /* Custom gradient borders */
        .gradient-border {
          position: relative;
          background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
          padding: 2px;
          border-radius: 12px;
        }

        .gradient-border > * {
          background: white;
          border-radius: 10px;
        }
      `}</style>
    </>
  );
}
