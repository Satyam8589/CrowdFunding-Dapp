import React, { createContext, useContext, useState, useEffect } from "react";
import { CHAIN_ID } from "../lib/constants";
import { ethers } from "ethers";

const NetworkContext = createContext();

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
};

export const NetworkProvider = ({ children }) => {
  const [currentChainId, setCurrentChainId] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [networkMode, setNetworkMode] = useState("browse"); // 'browse' | 'interact'
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Monitor wallet connection and network
  useEffect(() => {
    if (!isClient) return;

    const checkWalletConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          const connected = accounts.length > 0;
          setIsWalletConnected(connected);

          if (connected) {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            setCurrentChainId(network.chainId.toString());
          }
        } catch (error) {
          console.error("Failed to check wallet connection:", error);
          setIsWalletConnected(false);
        }
      }
    };

    checkWalletConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        setIsWalletConnected(accounts.length > 0);
        if (accounts.length === 0) {
          setCurrentChainId(null);
          setNetworkMode("browse");
        }
      };

      const handleChainChanged = (chainId) => {
        setCurrentChainId(parseInt(chainId, 16).toString());
      };

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener(
            "accountsChanged",
            handleAccountsChanged
          );
          window.ethereum.removeListener("chainChanged", handleChainChanged);
        }
      };
    }
  }, [isClient]);

  const isCorrectNetwork = () => {
    return currentChainId === CHAIN_ID.toString();
  };

  const needsNetworkSwitch = () => {
    // Only require network switch for interactive actions when wallet is connected
    return (
      networkMode === "interact" && isWalletConnected && !isCorrectNetwork()
    );
  };

  const canBrowse = () => {
    // Can always browse, regardless of network or wallet connection
    return true;
  };

  const canInteract = () => {
    // Can interact if wallet is connected and on correct network
    return isWalletConnected && isCorrectNetwork();
  };

  const switchToInteractMode = () => {
    setNetworkMode("interact");
  };

  const switchToBrowseMode = () => {
    setNetworkMode("browse");
  };

  const switchNetwork = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed!");
    }

    try {
      // Try to switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }], // 11155111 in hex
      });
    } catch (switchError) {
      // If Sepolia is not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xaa36a7",
              chainName: "Sepolia test network",
              nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://eth-sepolia.public.blastapi.io"],
              blockExplorerUrls: ["https://sepolia.etherscan.io/"],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed!");
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      // Wallet connection will be detected by the event listener
    } catch (error) {
      throw new Error("Failed to connect wallet: " + error.message);
    }
  };

  const value = {
    currentChainId,
    isWalletConnected,
    networkMode,
    isCorrectNetwork: isCorrectNetwork(),
    needsNetworkSwitch: needsNetworkSwitch(),
    canBrowse: canBrowse(),
    canInteract: canInteract(),
    switchToInteractMode,
    switchToBrowseMode,
    switchNetwork,
    connectWallet,
    targetChainId: CHAIN_ID.toString(),
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
};

export default NetworkProvider;
