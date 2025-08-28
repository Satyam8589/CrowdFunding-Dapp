import { useAccount, useSigner } from "wagmi";
import { useState, useEffect } from "react";
import { getContractInstance } from "../lib/contract";
import { ethers } from "ethers";

export const useContract = () => {
  const { address, isConnected } = useAccount();
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
      if (
        isClient &&
        isConnected &&
        typeof window !== "undefined" &&
        window.ethereum
      ) {
        try {
          setIsLoading(true);
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = getContractInstance(signer);
          setContract(contractInstance);
          setError(null);
        } catch (err) {
          console.error("Failed to initialize contract:", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      } else {
        setContract(null);
      }
    };

    initContract();
  }, [isConnected, address, isClient]);

  const createCampaign = async (campaignData) => {
    if (!contract) throw new Error("Contract not initialized");

    try {
      setIsLoading(true);
      setError(null);

      // Convert target from ETH to wei (BigInt)
      const targetInWei = ethers.parseEther(campaignData.target.toString());

      // Convert deadline to Unix timestamp (BigInt)
      const deadlineTimestamp = Math.floor(
        new Date(campaignData.deadline).getTime() / 1000
      );

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
    if (!contract) throw new Error("Contract not initialized");

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
