import { useState, useEffect } from "react";
import { useContract } from "./useContract";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI, CHAIN_ID } from "../lib/constants";
import { formatEther } from "../lib/utils";
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
        console.log("Campaign data type:", typeof campaignData);
        console.log("Campaign data length:", campaignData?.length);

        // Log each campaign's data types
        if (campaignData && campaignData.length > 0) {
          campaignData.forEach((campaign, index) => {
            console.log(`Campaign ${index} raw data:`, {
              id: campaign.id,
              idType: typeof campaign.id,
              target: campaign.target,
              targetType: typeof campaign.target,
              amountCollected: campaign.amountCollected,
              amountCollectedType: typeof campaign.amountCollected,
              title: campaign.title,
              owner: campaign.owner,
            });
          });
        }

        if (!campaignData || campaignData.length === 0) {
          console.log("No campaigns found");
          setCampaigns([]);
          setContractDiagnosis(null);
          return;
        }

        const formattedCampaigns = [];

        for (let index = 0; index < campaignData.length; index++) {
          try {
            const campaign = campaignData[index];
            console.log(`Formatting campaign ${index}:`, campaign);

            // Ultra-safe formatting for target
            let formattedTarget = "0";
            if (campaign.target !== undefined && campaign.target !== null) {
              try {
                // Convert to string first to check format
                const targetStr = campaign.target.toString();

                // If it contains only digits (wei), convert from wei to ETH
                if (/^\d+$/.test(targetStr) && targetStr !== "0") {
                  formattedTarget = formatEther(campaign.target);
                }
                // If it already looks like an ETH amount (contains decimal), use as is
                else if (/^\d+\.?\d*$/.test(targetStr)) {
                  formattedTarget = targetStr;
                }
                // If it's a hex string, convert from wei
                else if (targetStr.startsWith("0x")) {
                  formattedTarget = formatEther(campaign.target);
                }
                // Fallback: use the string value or default
                else {
                  formattedTarget = targetStr === "0" ? "0" : targetStr;
                }
              } catch (targetError) {
                console.warn(
                  `Error formatting target for campaign ${index}:`,
                  targetError
                );
                formattedTarget = "0";
              }
            }

            // Ultra-safe formatting for amountCollected
            let formattedAmount = "0";
            if (
              campaign.amountCollected !== undefined &&
              campaign.amountCollected !== null
            ) {
              try {
                // Convert to string first to check format
                const amountStr = campaign.amountCollected.toString();

                // If it contains only digits (wei), convert from wei to ETH
                if (/^\d+$/.test(amountStr) && amountStr !== "0") {
                  formattedAmount = formatEther(
                    campaign.amountCollected
                  );
                }
                // If it already looks like an ETH amount (contains decimal), use as is
                else if (/^\d+\.?\d*$/.test(amountStr)) {
                  formattedAmount = amountStr;
                }
                // If it's a hex string, convert from wei
                else if (amountStr.startsWith("0x")) {
                  formattedAmount = formatEther(
                    campaign.amountCollected
                  );
                }
                // Fallback: use the string value or default
                else {
                  formattedAmount = amountStr === "0" ? "0" : amountStr;
                }
              } catch (amountError) {
                console.warn(
                  `Error formatting amount for campaign ${index}:`,
                  amountError
                );
                formattedAmount = "0";
              }
            }

            const formattedCampaign = {
              id: campaign.id ? campaign.id.toString() : index.toString(),
              title: campaign.title || `Campaign ${index + 1}`,
              description: campaign.description || "No description available",
              imageUrl: campaign.imageUrl || "/images/placeholder.svg",
              owner:
                campaign.owner || "0x0000000000000000000000000000000000000000",
              target: formattedTarget,
              deadline: campaign.deadline ? campaign.deadline.toString() : "0",
              amountCollected: formattedAmount,
              withdrawn: campaign.withdrawn || false,
              donators: campaign.donators || [],
              donations: campaign.donations || [],
            };

            formattedCampaigns.push(formattedCampaign);
            console.log(
              `Successfully formatted campaign ${index}:`,
              formattedCampaign
            );
          } catch (campaignError) {
            console.error(`Error processing campaign ${index}:`, campaignError);
            // Skip this campaign but continue with others
            continue;
          }
        }

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

  // Get a single campaign by ID - works without wallet connection
  const getCampaignById = async (id) => {
    try {
      console.log(`Fetching campaign ${id}...`);

      // Ensure we're on the client side
      if (typeof window === "undefined") {
        console.log("Server-side rendering, cannot fetch campaign");
        throw new Error("Cannot fetch campaign on server-side");
      }

      // Try to get provider, but don't require wallet connection
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
              console.log(`Trying RPC endpoint for campaign: ${rpcUrl}`);
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

      // Fetch the specific campaign
      console.log("Fetching campaign from contract...");
      const campaign = await contractInstance.getCampaign(id);
      console.log("Raw campaign data:", campaign);

      // Ultra-safe formatting for target
      let formattedTarget = "0";
      if (campaign.target !== undefined && campaign.target !== null) {
        try {
          const targetStr = campaign.target.toString();
          if (/^\d+$/.test(targetStr) && targetStr !== "0") {
            formattedTarget = formatEther(campaign.target);
          } else if (/^\d+\.?\d*$/.test(targetStr)) {
            formattedTarget = targetStr;
          } else if (targetStr.startsWith("0x")) {
            formattedTarget = formatEther(campaign.target);
          } else {
            formattedTarget = targetStr === "0" ? "0" : targetStr;
          }
        } catch (targetError) {
          console.warn(`Error formatting target:`, targetError);
          formattedTarget = "0";
        }
      }

      // Ultra-safe formatting for amountCollected
      let formattedAmount = "0";
      if (
        campaign.amountCollected !== undefined &&
        campaign.amountCollected !== null
      ) {
        try {
          const amountStr = campaign.amountCollected.toString();
          if (/^\d+$/.test(amountStr) && amountStr !== "0") {
            formattedAmount = formatEther(campaign.amountCollected);
          } else if (/^\d+\.?\d*$/.test(amountStr)) {
            formattedAmount = amountStr;
          } else if (amountStr.startsWith("0x")) {
            formattedAmount = formatEther(campaign.amountCollected);
          } else {
            formattedAmount = amountStr === "0" ? "0" : amountStr;
          }
        } catch (amountError) {
          console.warn(`Error formatting amount:`, amountError);
          formattedAmount = "0";
        }
      }

      const formattedCampaign = {
        id: campaign.id ? campaign.id.toString() : id.toString(),
        title: campaign.title || `Campaign ${id}`,
        description: campaign.description || "No description available",
        imageUrl: campaign.imageUrl || "/images/placeholder.svg",
        owner: campaign.owner || "0x0000000000000000000000000000000000000000",
        target: formattedTarget,
        deadline: campaign.deadline ? campaign.deadline.toString() : "0",
        amountCollected: formattedAmount,
        withdrawn: campaign.withdrawn || false,
      };

      console.log("Formatted campaign:", formattedCampaign);
      return formattedCampaign;
    } catch (err) {
      console.error("Error fetching campaign:", err);
      throw err;
    }
  };

  // Get donators for a campaign - works without wallet connection (view function)
  const getDonators = async (campaignId) => {
    try {
      console.log(`Fetching donators for campaign ${campaignId}...`);

      // Ensure we're on the client side
      if (typeof window === "undefined") {
        console.log("Server-side rendering, cannot fetch donators");
        return { donators: [], donations: [] };
      }

      // Try to get provider, but don't require wallet connection (same logic as getCampaignById)
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
              console.log(`Trying RPC endpoint for donators: ${rpcUrl}`);
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
          return { donators: [], donations: [] };
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
          return { donators: [], donations: [] };
        }
      }

      // Fetch donators - this is a view function so it works without wallet
      console.log("About to call getDonators with campaignId:", campaignId);
      const result = await contractInstance.getDonators(campaignId);
      console.log("getDonators result:", result);
      console.log("Result type:", typeof result);
      console.log("Is array:", Array.isArray(result));

      let donators, donations;

      // Handle different possible return formats
      if (Array.isArray(result) && result.length === 2) {
        // If it's a tuple array [donators, donations]
        [donators, donations] = result;
      } else if (
        result &&
        typeof result === "object" &&
        result.donators &&
        result.donations
      ) {
        // If it's an object {donators, donations}
        donators = result.donators;
        donations = result.donations;
      } else if (
        result &&
        Array.isArray(result[0]) &&
        Array.isArray(result[1])
      ) {
        // If it's a nested structure
        donators = result[0];
        donations = result[1];
      } else {
        console.error("Unexpected getDonators result format:", result);
        donators = [];
        donations = [];
      }

      console.log("Raw donators data:", { donators, donations });
      console.log("Donators length:", donators?.length);
      console.log("Donations length:", donations?.length);

      return {
        donators: donators || [],
        donations: donations
          ? donations.map((d) => {
              // Check if it's already a formatted string or needs conversion
              if (typeof d === "string" && !d.includes("e")) {
                // Already formatted, return as is
                return d;
              } else {
                // Convert from wei to ETH
                try {
                  return formatEther(d);
                } catch (error) {
                  console.warn("Could not format donation amount:", d, error);
                  return "0.0000";
                }
              }
            })
          : [],
      };
    } catch (err) {
      console.error("Error fetching donators:", err);
      // Return empty arrays instead of throwing for better UX
      return {
        donators: [],
        donations: [],
      };
    }
  };

  return {
    campaigns,
    isLoading,
    error,
    contractDiagnosis,
    fetchCampaigns,
    fetchCampaignsWithRetry,
    getCampaignById,
    getDonators,
  };
};
