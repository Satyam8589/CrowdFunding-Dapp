import { useState, useEffect } from "react";
import { useContract } from "./useContract";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI, CHAIN_ID } from "../lib/constants";
import {
  diagnoseContractIssue,
  checkContractDeployment,
} from "../lib/contractUtils";

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contractDiagnosis, setContractDiagnosis] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const { contract } = useContract();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch campaigns function - avoiding useCallback for build stability
  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure we're on the client side before accessing window objects
      if (typeof window === "undefined") {
        console.log("Server-side rendering, skipping wallet check");
        setIsLoading(false);
        return;
      }

      // Try to get provider, but don't require wallet connection for browsing
      let provider;

      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const browserProvider = new ethers.BrowserProvider(window.ethereum);

          // Check network if wallet is available (but don't require connection)
          const network = await browserProvider.getNetwork();

          if (network.chainId.toString() === CHAIN_ID) {
            provider = browserProvider;
          } else {
            console.log(
              `Connected to wrong network: ${network.chainId}, expected: ${CHAIN_ID}`
            );
            // Continue with public provider fallback
          }
        } catch (networkError) {
          console.log(
            "Network check failed, using public provider:",
            networkError.message
          );
          // Continue with public provider fallback
        }
      }

      // If no browser provider or wrong network, use public provider
      if (!provider) {
        try {
          // Multiple RPC endpoints for reliability
          const rpcEndpoints = [
            "https://eth-sepolia.public.blastapi.io",
            "https://rpc.sepolia.org",
            "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
            `https://sepolia.infura.io/v3/${
              process.env.NEXT_PUBLIC_INFURA_PROJECT_ID ||
              "9aa3d95b3bc440fa88ea12eaa4456161"
            }`,
          ];

          let connected = false;
          for (const rpcUrl of rpcEndpoints) {
            try {
              console.log(`Trying RPC endpoint: ${rpcUrl}`);
              provider = new ethers.JsonRpcProvider(rpcUrl);

              // Test the connection
              await provider.getBlockNumber();
              console.log(`Successfully connected to: ${rpcUrl}`);
              connected = true;
              break;
            } catch (rpcError) {
              console.log(`RPC endpoint ${rpcUrl} failed:`, rpcError.message);
              continue;
            }
          }

          if (!connected) {
            throw new Error("All RPC endpoints failed");
          }
        } catch (providerError) {
          console.error("Failed to get provider:", providerError);
          throw new Error(
            `Provider connection failed: ${providerError.message}`
          );
        }
      }

      // Create contract instance
      let contractInstance;
      if (contract) {
        contractInstance = contract;
      } else {
        try {
          contractInstance = new ethers.Contract(
            CONTRACT_ADDRESS,
            CROWDFUNDING_ABI,
            provider
          );
        } catch (contractError) {
          console.error("Failed to create contract instance:", contractError);
          throw new Error(
            `Contract instantiation failed: ${contractError.message}`
          );
        }
      }

      try {
        console.log("Fetching campaigns from contract...");
        const campaignData = await contractInstance.getAllCampaigns();
        console.log("Raw campaign data:", campaignData);

        if (!campaignData || campaignData.length === 0) {
          console.log("No campaigns found");
          setCampaigns([]);
          setContractDiagnosis(null);
          return;
        }

        const formattedCampaigns = campaignData.map((campaign, index) => ({
          id: campaign.id ? campaign.id.toString() : index.toString(),
          title: campaign.title || `Campaign ${index + 1}`,
          description: campaign.description || "No description available",
          imageUrl: campaign.imageUrl || "/images/placeholder.svg",
          owner: campaign.owner || "0x0000000000000000000000000000000000000000",
          target: campaign.target ? ethers.formatEther(campaign.target) : "0",
          deadline: campaign.deadline ? campaign.deadline.toString() : "0",
          amountCollected: campaign.amountCollected
            ? ethers.formatEther(campaign.amountCollected)
            : "0",
          withdrawn: campaign.withdrawn || false,
          donators: campaign.donators || [],
          donations: campaign.donations || [],
        }));

        console.log("Formatted campaigns:", formattedCampaigns);
        setCampaigns(formattedCampaigns);
        setContractDiagnosis(null);
      } catch (contractCallError) {
        console.error("Contract call failed:", contractCallError);

        // Detailed error handling for contract issues
        if (
          contractCallError.message.includes("could not decode result data")
        ) {
          const diagnosis = await diagnoseContractIssue(
            CONTRACT_ADDRESS,
            provider
          );
          setContractDiagnosis(diagnosis);
          throw new Error(`Contract decoding error - ${diagnosis.summary}`);
        } else if (contractCallError.message.includes("network")) {
          throw new Error(`Network error: ${contractCallError.message}`);
        } else {
          throw new Error(`Contract call failed: ${contractCallError.message}`);
        }
      }
    } catch (error) {
      console.error("fetchCampaigns error:", error);
      setError(error.message);

      // Additional diagnostics for persistent errors
      if (
        error.message.includes("Contract") ||
        error.message.includes("decode")
      ) {
        try {
          const diagnosis = await diagnoseContractIssue(CONTRACT_ADDRESS, null);
          setContractDiagnosis(diagnosis);
        } catch (diagnosisError) {
          console.error("Diagnosis failed:", diagnosisError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch campaigns when client is ready
  useEffect(() => {
    if (isClient) {
      fetchCampaigns();
    }
    // Note: We're not including fetchCampaigns in deps to avoid useCallback issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Refetch when contract changes
  useEffect(() => {
    if (isClient && contract) {
      fetchCampaigns();
    }
    // Note: We're not including fetchCampaigns in deps to avoid useCallback issues
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract, isClient]);

  // Retry function for manual retries
  const fetchCampaignsWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await fetchCampaigns();
        return; // Success, exit retry loop
      } catch (retryError) {
        console.error(`Attempt ${attempt} failed:`, retryError.message);
        if (attempt === maxRetries) {
          throw retryError; // Final attempt failed
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
      }
    }
  };

  return {
    campaigns,
    isLoading,
    error,
    contractDiagnosis,
    fetchCampaigns,
    fetchCampaignsWithRetry,
  };
};
