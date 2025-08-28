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

      // Convert amount from ETH to wei if it's a string/number
      const amountInWei =
        typeof amount === "string" || typeof amount === "number"
          ? ethers.parseEther(amount.toString())
          : amount;

      console.log("Donating to campaign:", {
        campaignId,
        amount,
        amountInWei: amountInWei.toString(),
      });

      const result = await contract.donateToCampaign(campaignId, {
        value: amountInWei,
      });
      return result;
    } catch (err) {
      setError(err.message);
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
