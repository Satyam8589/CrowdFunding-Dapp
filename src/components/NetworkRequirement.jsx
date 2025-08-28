import React from "react";
import { useNetwork } from "../contexts/NetworkContext";

const NetworkRequirement = ({
  action = "interact",
  children,
  showButton = true,
}) => {
  const {
    isWalletConnected,
    needsNetworkSwitch,
    canInteract,
    switchNetwork,
    connectWallet,
    switchToInteractMode,
    networkMode,
    currentChainId,
    targetChainId,
  } = useNetwork();

  // If user is just browsing, show the content without restrictions
  if (networkMode === "browse") {
    return children;
  }

  // If user wants to interact, check requirements
  if (action === "interact") {
    // If wallet not connected
    if (!isWalletConnected) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
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
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Connect Wallet to{" "}
                {action === "create"
                  ? "Create Campaign"
                  : action === "fund"
                  ? "Fund Campaign"
                  : action === "withdraw"
                  ? "Withdraw Funds"
                  : "Interact"}
              </h3>
              <p className="text-blue-700 mb-4">
                Connect your wallet to create campaigns, fund projects, and
                manage your contributions.
              </p>
              {showButton && (
                <button
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If wrong network
    if (needsNetworkSwitch) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-orange-900 mb-2">
                Switch to Sepolia Network
              </h3>
              <p className="text-orange-700 mb-4">
                You're currently on network {currentChainId}. Please switch to
                Sepolia Testnet (Chain ID: {targetChainId}) to{" "}
                {action === "create"
                  ? "create campaigns"
                  : action === "fund"
                  ? "fund campaigns"
                  : action === "withdraw"
                  ? "withdraw funds"
                  : "interact with campaigns"}
                .
              </p>
              {showButton && (
                <button
                  onClick={switchNetwork}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
                >
                  Switch to Sepolia
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    // If all requirements met, show content
    if (canInteract) {
      return children;
    }
  }

  // Default: show content for browsing
  return children;
};

export default NetworkRequirement;
