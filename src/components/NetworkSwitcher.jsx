import React, { useState } from "react";
import { CHAIN_ID } from "../lib/constants";

const NetworkSwitcher = ({ currentChainId, onNetworkSwitch }) => {
  const [switching, setSwitching] = useState(false);

  const networks = {
    1: { name: "Ethereum Mainnet", color: "text-blue-600" },
    11155111: { name: "Sepolia Testnet", color: "text-green-600" },
    137: { name: "Polygon Mainnet", color: "text-purple-600" },
    80001: { name: "Mumbai Testnet", color: "text-purple-400" },
  };

  const currentNetwork = networks[currentChainId] || {
    name: `Unknown Network (${currentChainId})`,
    color: "text-red-600",
  };

  const targetNetwork = networks[CHAIN_ID.toString()] || {
    name: `Chain ID ${CHAIN_ID}`,
    color: "text-green-600",
  };

  const switchToSepolia = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return;
    }

    setSwitching(true);
    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
      });

      if (onNetworkSwitch) {
        onNetworkSwitch();
      }
    } catch (switchError) {
      // If Sepolia is not added, add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xaa36a7",
                chainName: "Sepolia test network",
                rpcUrls: ["https://rpc.sepolia.org"],
                nativeCurrency: {
                  name: "ETH",
                  symbol: "ETH",
                  decimals: 18,
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io"],
              },
            ],
          });

          if (onNetworkSwitch) {
            onNetworkSwitch();
          }
        } catch (addError) {
          console.error("Failed to add Sepolia network:", addError);
          alert(
            "Failed to add Sepolia network. Please add it manually in MetaMask."
          );
        }
      } else {
        console.error("Failed to switch network:", switchError);
        alert("Failed to switch network. Please switch manually in MetaMask.");
      }
    } finally {
      setSwitching(false);
    }
  };

  const isCorrectNetwork = currentChainId === CHAIN_ID.toString();

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Network Status
        </h3>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Current:</span>
            <span className={`font-medium ${currentNetwork.color}`}>
              {currentNetwork.name}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600">Required:</span>
            <span className={`font-medium ${targetNetwork.color}`}>
              {targetNetwork.name}
            </span>
          </div>
        </div>
      </div>

      {!isCorrectNetwork && (
        <div className="space-y-4">
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ You're connected to the wrong network. Please switch to Sepolia
              to use this app.
            </p>
          </div>

          <button
            onClick={switchToSepolia}
            disabled={switching}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {switching ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Switching...
              </span>
            ) : (
              "Switch to Sepolia"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Or switch manually:</p>
            <ol className="text-xs text-gray-500 text-left space-y-1">
              <li>1. Open MetaMask</li>
              <li>2. Click the network dropdown</li>
              <li>3. Select "Sepolia test network"</li>
              <li>4. Refresh this page</li>
            </ol>
          </div>
        </div>
      )}

      {isCorrectNetwork && (
        <div className="p-3 bg-green-100 border border-green-300 rounded-lg">
          <p className="text-green-800 text-sm text-center">
            ✅ Connected to the correct network!
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkSwitcher;
