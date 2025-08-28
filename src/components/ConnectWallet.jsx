"use client";

import { useState, useEffect } from "react";
import { useWallet } from "../hooks/useWallet";
import { formatAddress } from "../lib/utils";

export default function ConnectWallet() {
  const {
    address,
    isConnected,
    isConnecting,
    isCorrectNetwork,
    connectors,
    connectError,
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork,
  } = useWallet();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering wallet-dependent content until mounted
  if (!isMounted) {
    return (
      <div className="flex items-center space-x-4">
        <div className="bg-gray-300 animate-pulse h-10 w-32 rounded-lg"></div>
      </div>
    );
  }

  if (isConnected && !isCorrectNetwork) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-red-500 text-sm">Wrong Network</span>
        <button
          onClick={switchToCorrectNetwork}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Switch Network
        </button>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <span className="w-2 h-2 bg-green-300 rounded-full"></span>
          <span>{formatAddress(address)}</span>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">Connected Account</p>
              <p className="text-sm font-mono break-all">{address}</p>
            </div>
            <button
              onClick={() => {
                disconnectWallet();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {connectError && (
        <span className="text-red-500 text-sm">Connection failed</span>
      )}

      <div className="flex space-x-2">
        {connectors.map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connectWallet(connector)}
            disabled={isConnecting}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            {isConnecting ? "Connecting..." : `Connect ${connector.name}`}
          </button>
        ))}
      </div>
    </div>
  );
}
