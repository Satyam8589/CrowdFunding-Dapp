"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [walletMenuPosition, setWalletMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const buttonRef = useRef(null);
  const walletButtonRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 224 + window.scrollX, // 224px is the width of the dropdown (w-56)
      });
    }
  }, [isMenuOpen]);

  useEffect(() => {
    if (isWalletMenuOpen && walletButtonRef.current) {
      const rect = walletButtonRef.current.getBoundingClientRect();
      setWalletMenuPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
      });
    }
  }, [isWalletMenuOpen]);

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
      <div className="flex items-center space-x-2">
        {/* Address Display */}
        <div className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg">
          <span className="w-2 h-2 bg-green-300 rounded-full"></span>
          <span>{formatAddress(address)}</span>
        </div>

        {/* Dropdown Menu Button */}
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition-colors"
            title="Account Menu"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isMenuOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Portal-based dropdown menu */}
          {isMenuOpen &&
            isMounted &&
            createPortal(
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div
                  className="fixed inset-0 z-[9998]"
                  onClick={() => setIsMenuOpen(false)}
                ></div>

                <div
                  className="fixed w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
                  style={{
                    top: `${menuPosition.top}px`,
                    left: `${menuPosition.left}px`,
                  }}
                >
                  <div className="p-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600 mb-1">
                      Connected Account
                    </p>
                    <p className="text-xs font-mono break-all text-gray-800 bg-gray-50 p-2 rounded">
                      {address}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-b-lg transition-colors flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Disconnect Wallet</span>
                  </button>
                </div>
              </>,
              document.body
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {connectError && (
        <span className="text-red-500 text-sm mr-2">Connection failed</span>
      )}

      <div className="relative">
        <button
          ref={walletButtonRef}
          onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
          disabled={isConnecting || connectors.length === 0}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2"
        >
          <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
          <svg
            className={`w-4 h-4 transition-transform ${
              isWalletMenuOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {/* Wallet Selection Menu */}
        {isWalletMenuOpen &&
          isMounted &&
          createPortal(
            <>
              {/* Backdrop to close menu when clicking outside */}
              <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsWalletMenuOpen(false)}
              ></div>

              <div
                className="fixed min-w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999]"
                style={{
                  top: `${walletMenuPosition.top}px`,
                  left: `${walletMenuPosition.left}px`,
                }}
              >
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Choose Wallet
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Select your preferred wallet to connect
                  </p>
                </div>

                <div className="p-2">
                  {connectors.map((connector) => (
                    <button
                      key={connector.id}
                      onClick={() => {
                        connectWallet(connector);
                        setIsWalletMenuOpen(false);
                      }}
                      disabled={isConnecting}
                      className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Wallet Icon */}
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                      </div>

                      {/* Wallet Info */}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 group-hover:text-blue-600">
                          {connector.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {connector.type === "injected" && "Browser Extension"}
                          {connector.type === "walletConnect" &&
                            "Mobile & Desktop"}
                          {connector.type === "coinbaseWallet" &&
                            "Coinbase Wallet"}
                          {![
                            "injected",
                            "walletConnect",
                            "coinbaseWallet",
                          ].includes(connector.type) &&
                            "Connect using " + connector.name}
                        </div>
                      </div>

                      {/* Arrow */}
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>

                {connectors.length === 0 && (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No wallets detected. Please install a wallet extension.
                  </div>
                )}
              </div>
            </>,
            document.body
          )}
      </div>
    </div>
  );
}
