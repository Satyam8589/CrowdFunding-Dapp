import { useAccount, useWalletClient, usePublicClient } from "wagmi";
import { useState, useEffect } from "react";
import { getContractInstance } from "../lib/contract";
import { convertDeadlineToTimestamp } from "../lib/utils";
import { ethers } from "ethers";

export const useContract = () => {
  const { address, isConnected, connector } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const initContract = async () => {
      if (isClient && isConnected && walletClient) {
        try {
          setIsLoading(true);
          console.log("🔄 Initializing contract...", {
            isConnected,
            walletClient: !!walletClient,
            connector: connector?.name,
          });

          // Create provider and signer based on the wallet client
          let provider, signer;

          if (walletClient) {
            // For wagmi v2, we need to use the walletClient directly
            if (
              typeof window !== "undefined" &&
              window.ethereum &&
              connector?.name !== "WalletConnect"
            ) {
              // Use window.ethereum for injected wallets (MetaMask mobile, etc.)
              provider = new ethers.BrowserProvider(window.ethereum);
              signer = await provider.getSigner();
            } else {
              // For WalletConnect and other non-injected wallets
              // Create a custom provider from walletClient
              provider = new ethers.BrowserProvider({
                request: walletClient.request.bind(walletClient),
              });
              signer = await provider.getSigner();
            }
          } else if (typeof window !== "undefined" && window.ethereum) {
            // Fallback to window.ethereum
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
          } else {
            throw new Error(
              "No wallet provider available. Please ensure your wallet is properly connected."
            );
          }

          const contractInstance = getContractInstance(signer);
          setContract(contractInstance);
          setError(null);
          console.log("✅ Contract initialized successfully");
        } catch (err) {
          console.error("❌ Failed to initialize contract:", err);
          setError(`Contract initialization failed: ${err.message}`);

          // For mobile wallets, show more helpful error message
          if (
            err.message.includes("No wallet provider") ||
            err.message.includes("walletClient")
          ) {
            setError(
              "Please make sure your wallet app is open and connected, then refresh the page."
            );
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        setContract(null);
        if (isClient) {
          console.log("⚠️ Contract not initialized:", {
            isConnected,
            walletClient: !!walletClient,
            isClient,
            connectorName: connector?.name,
          });
        }
      }
    };

    initContract();
  }, [isConnected, address, isClient, walletClient, connector]);

  const createCampaign = async (campaignData) => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      setIsLoading(true);
      setError(null);

      console.log(
        "🔍 DEBUG: Starting campaign creation with data:",
        campaignData
      );

      // Convert target from ETH to wei (BigInt)
      const targetInWei = ethers.parseEther(campaignData.target.toString());

      // Convert deadline to Unix timestamp with proper timezone handling
      console.log(
        "🔍 DEBUG: About to convert deadline:",
        campaignData.deadline
      );
      const deadlineTimestamp = convertDeadlineToTimestamp(
        campaignData.deadline
      );
      console.log("🔍 DEBUG: Converted deadline timestamp:", deadlineTimestamp);

      console.log("Creating campaign with:", {
        title: campaignData.title,
        description: campaignData.description,
        imageUrl: campaignData.imageUrl,
        target: campaignData.target,
        targetInWei: targetInWei.toString(),
        deadline: campaignData.deadline,
        deadlineTimestamp,
      });

      const result = await contract.createCampaign(
        campaignData.title,
        campaignData.description,
        campaignData.imageUrl,
        targetInWei,
        deadlineTimestamp
      );
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const donateToCampaign = async (campaignId, amount) => {
    // Enhanced mobile wallet compatibility - retry contract initialization if needed
    if (!contract) {
      console.log("🔄 Contract not ready, attempting to initialize...");

      // Try to reinitialize contract for mobile wallets
      if (isConnected && walletClient) {
        try {
          let provider, signer;

          if (
            typeof window !== "undefined" &&
            window.ethereum &&
            connector?.name !== "WalletConnect"
          ) {
            // Use window.ethereum for injected wallets (MetaMask mobile, etc.)
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
          } else {
            // For WalletConnect and other non-injected wallets
            provider = new ethers.BrowserProvider({
              request: walletClient.request.bind(walletClient),
            });
            signer = await provider.getSigner();
          }

          const contractInstance = getContractInstance(signer);
          setContract(contractInstance);
          console.log("✅ Contract reinitialized successfully for mobile");

          // Use the newly initialized contract for this transaction
          contract = contractInstance;
        } catch (retryError) {
          console.error("❌ Failed to reinitialize contract:", retryError);
          throw new Error(
            "Unable to initialize contract. Please try connecting your wallet again."
          );
        }
      } else {
        throw new Error(
          "Wallet not connected. Please connect your wallet and try again."
        );
      }
    }

    // Final check to ensure contract is available
    if (!contract) {
      throw new Error(
        "Contract initialization failed. Please refresh the page and try again."
      );
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log("donateToCampaign called with:", {
        campaignId,
        amount,
        amountType: typeof amount,
        amountValue: amount,
      });

      // Defensive amount validation and conversion
      let cleanAmount;

      if (typeof amount === "object" && amount !== null) {
        console.error("Amount is an object:", amount);
        throw new Error(
          "Amount cannot be an object. Please provide a string or number."
        );
      }

      if (amount === null || amount === undefined || amount === "") {
        throw new Error("Amount is required");
      }

      // Convert to string first, then validate
      cleanAmount = amount.toString().trim();

      if (cleanAmount === "" || isNaN(parseFloat(cleanAmount))) {
        throw new Error("Amount must be a valid number");
      }

      // Ensure it's a positive number
      const numericAmount = parseFloat(cleanAmount);
      if (numericAmount <= 0) {
        throw new Error("Amount must be greater than 0");
      }

      // Convert amount from ETH to wei
      const amountInWei = ethers.parseEther(cleanAmount);

      console.log("Donating to campaign:", {
        campaignId,
        originalAmount: amount,
        cleanAmount,
        numericAmount,
        amountInWei: amountInWei.toString(),
      });

      const result = await contract.donateToCampaign(campaignId, cleanAmount);
      return result;
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

      // Only log actual errors, not user rejections
      if (!isUserRejection) {
        console.error("donateToCampaign error:", err);
        setError(err.message);
      } else {
        // Clear any existing errors for user rejections
        setError(null);
      }

      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const withdrawFunds = async (campaignId) => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      setIsLoading(true);
      setError(null);
      const result = await contract.withdrawFunds(campaignId);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    contract,
    isLoading,
    error,
    createCampaign,
    donateToCampaign,
    withdrawFunds,
  };
};
