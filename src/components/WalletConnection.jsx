import React, { useState, useEffect } from "react";

const WalletConnection = ({ onConnect }) => {
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    checkWalletStatus();

    if (window.ethereum) {
      // Listen for account changes
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("connect", handleConnect);
      window.ethereum.on("disconnect", handleDisconnect);

      return () => {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("connect", handleConnect);
        window.ethereum.removeListener("disconnect", handleDisconnect);
      };
    }
  }, []);

  const checkWalletStatus = async () => {
    if (typeof window.ethereum !== "undefined") {
      setIsMetaMaskInstalled(true);

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setAccounts(accounts);
        setIsConnected(accounts.length > 0);
      } catch (error) {
        console.error("Error checking wallet status:", error);
      }
    } else {
      setIsMetaMaskInstalled(false);
      setIsConnected(false);
    }
  };

  const handleAccountsChanged = (accounts) => {
    setAccounts(accounts);
    setIsConnected(accounts.length > 0);

    if (accounts.length === 0) {
      // User disconnected wallet
      console.log("Wallet disconnected");
    }
  };

  const handleConnect = () => {
    setIsConnected(true);
    if (onConnect) onConnect();
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setAccounts([]);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not installed. Please install MetaMask first.");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      setAccounts(accounts);
      setIsConnected(true);

      if (onConnect) {
        onConnect();
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        alert("Connection rejected. Please approve the connection request.");
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const installMetaMask = () => {
    window.open("https://metamask.io/download/", "_blank");
  };

  if (!isMetaMaskInstalled) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            MetaMask Required
          </h3>
          <p className="text-gray-600 mb-6">
            To use this decentralized crowdfunding platform, you need to install
            MetaMask wallet.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={installMetaMask}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Install MetaMask
          </button>

          <button
            onClick={checkWalletStatus}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            I Already Have MetaMask
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">What is MetaMask?</p>
          <p className="text-xs">
            MetaMask is a crypto wallet that lets you interact with blockchain
            applications. It's free, secure, and easy to use.
          </p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8 max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Connect Your Wallet
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your MetaMask wallet to start creating and funding
            campaigns.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {isConnecting ? (
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
                Connecting...
              </span>
            ) : (
              "Connect MetaMask"
            )}
          </button>
        </div>

        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">Why connect?</p>
          <ul className="text-xs space-y-1">
            <li>• Create crowdfunding campaigns</li>
            <li>• Donate to existing campaigns</li>
            <li>• Withdraw funds from your campaigns</li>
            <li>• View campaign details and progress</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto text-center">
      <div className="flex items-center justify-center mb-2">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
        <span className="text-green-800 font-medium">Wallet Connected</span>
      </div>
      <p className="text-green-600 text-sm">
        {accounts[0]?.substring(0, 6)}...{accounts[0]?.substring(38)}
      </p>
    </div>
  );
};

export default WalletConnection;
