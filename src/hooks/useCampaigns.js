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

  // Only run fetchCampaigns on client side
  useEffect(() => {
    if (isClient) {
      fetchCampaigns();
    }
  }, [isClient]);

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

          if (network.chainId.toString() === CHAIN_ID.toString()) {
            // If on correct network, use the wallet provider
            provider = browserProvider;
            console.log("✅ Using wallet provider on correct network");
          } else {
            // If on wrong network, always use public RPC for browsing
            console.warn(
              `Wrong network detected: ${network.chainId}, expected: ${CHAIN_ID}. Using public RPC for browsing.`
            );

            // Force fallback to public RPC for browsing
            const rpcEndpoints = [
              "https://eth-sepolia.public.blastapi.io",
              "https://sepolia.drpc.org",
              "https://rpc.sepolia.org",
            ];

            for (const rpc of rpcEndpoints) {
              try {
                provider = new ethers.JsonRpcProvider(rpc);
                await provider.getNetwork(); // Test connection
                console.log(`✅ Connected to public RPC for browsing: ${rpc}`);
                break;
              } catch (rpcError) {
                console.warn(`Failed to connect to ${rpc}:`, rpcError.message);
                continue;
              }
            }
          }
        } catch (providerError) {
          console.warn(
            "Wallet provider error, using public RPC:",
            providerError
          );
          // Fall back to public provider with multiple RPC endpoints
          const rpcEndpoints = [
            "https://eth-sepolia.public.blastapi.io",
            "https://sepolia.drpc.org",
            "https://rpc.sepolia.org",
          ];

          for (const rpc of rpcEndpoints) {
            try {
              provider = new ethers.JsonRpcProvider(rpc);
              await provider.getNetwork(); // Test connection
              console.log(`✅ Connected to RPC: ${rpc}`);
              break;
            } catch (rpcError) {
              console.warn(`Failed to connect to ${rpc}:`, rpcError.message);
              continue;
            }
          }

          if (!provider) {
            throw new Error("All RPC endpoints failed to connect");
          }
        }
      } else {
        // Use public RPC when no wallet is available
        const rpcEndpoints = [
          "https://eth-sepolia.public.blastapi.io",
          "https://sepolia.drpc.org",
          "https://rpc.sepolia.org",
        ];

        for (const rpc of rpcEndpoints) {
          try {
            provider = new ethers.JsonRpcProvider(rpc);
            await provider.getNetwork(); // Test connection
            console.log(`✅ Connected to public RPC: ${rpc}`);
            break;
          } catch (rpcError) {
            console.warn(`Failed to connect to ${rpc}:`, rpcError.message);
            continue;
          }
        }

        if (!provider) {
          throw new Error("All public RPC endpoints failed to connect");
        }
        console.log(
          "No wallet detected, using public RPC for read-only access"
        );
      }

      // Check if contract is deployed
      const deploymentCheck = await checkContractDeployment(provider);
      if (!deploymentCheck.isDeployed) {
        const diagnosis = await diagnoseContractIssue();
        setContractDiagnosis(diagnosis);
        throw new Error(
          diagnosis.issue || "Contract not found at the specified address"
        );
      }

      let readOnlyContract;

      if (contract) {
        // Use connected contract if available
        const campaignsData = await contract.getAllCampaigns();
        setCampaigns(campaignsData);
      } else {
        // Use read-only contract for browsing
        readOnlyContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CROWDFUNDING_ABI,
          provider
        );

        try {
          const totalCampaigns = await readOnlyContract.getTotalCampaigns();
          console.log(
            "Total campaigns from contract:",
            totalCampaigns.toString()
          );

          if (totalCampaigns == 0) {
            console.log("No campaigns found in the contract");
            setCampaigns([]);
            return;
          }

          const campaignsData = [];
          for (let i = 0; i < totalCampaigns; i++) {
            try {
              const campaign = await readOnlyContract.getCampaign(i);
              campaignsData.push({
                id: campaign.id.toString(),
                title: campaign.title,
                description: campaign.description,
                imageUrl: campaign.imageUrl,
                owner: campaign.owner,
                target: ethers.formatEther(campaign.target),
                deadline: campaign.deadline.toString(),
                amountCollected: ethers.formatEther(campaign.amountCollected),
                withdrawn: campaign.withdrawn,
              });
            } catch (campaignError) {
              console.error(`Error fetching campaign ${i}:`, campaignError);
            }
          }

          setCampaigns(campaignsData);
        } catch (contractError) {
          console.error("Contract call failed:", contractError);

          // Only show error for actual contract issues, not wallet/network issues in browse mode
          if (
            !contractError.message.includes("wallet") &&
            !contractError.message.includes("account") &&
            !contractError.message.includes("network")
          ) {
            const diagnosis = await diagnoseContractIssue(true); // Allow network mismatch for browsing
            setContractDiagnosis(diagnosis);
            throw new Error(
              `Contract interaction failed: ${contractError.message}`
            );
          } else {
            // For wallet/network issues, just log and continue (browsing mode)
            console.log(
              "Wallet/network issue detected, but allowing browsing:",
              contractError.message
            );
          }
        }
      }
    } catch (err) {
      console.error("Error loading campaigns:", err);
      setError(err.message);

      // If no diagnosis was set, create one (allow network mismatch for browsing)
      if (!contractDiagnosis) {
        const diagnosis = await diagnoseContractIssue(true);
        setContractDiagnosis(diagnosis);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCampaignsWithRetry = async (maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await fetchCampaigns();
        return; // Success, exit retry loop
      } catch (error) {
        console.error(`Attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error; // Last attempt failed, throw error
        }
        // Wait before retrying (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  };

  const getCampaignById = async (id) => {
    try {
      if (contract) {
        return await contract.getCampaign(id);
      } else {
        // Use the same provider logic as fetchCampaigns for consistency
        let provider;

        if (typeof window !== "undefined" && window.ethereum) {
          try {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            const network = await browserProvider.getNetwork();

            if (network.chainId.toString() === CHAIN_ID.toString()) {
              provider = browserProvider;
            } else {
              // Use public RPC for wrong network
              const rpcEndpoints = [
                "https://eth-sepolia.public.blastapi.io",
                "https://sepolia.drpc.org",
                "https://rpc.sepolia.org",
              ];

              for (const rpc of rpcEndpoints) {
                try {
                  provider = new ethers.JsonRpcProvider(rpc);
                  await provider.getNetwork();
                  break;
                } catch (rpcError) {
                  continue;
                }
              }
            }
          } catch (error) {
            // Fallback to public RPC
            const rpcEndpoints = [
              "https://eth-sepolia.public.blastapi.io",
              "https://sepolia.drpc.org",
              "https://rpc.sepolia.org",
            ];

            for (const rpc of rpcEndpoints) {
              try {
                provider = new ethers.JsonRpcProvider(rpc);
                await provider.getNetwork();
                break;
              } catch (rpcError) {
                continue;
              }
            }
          }
        } else {
          // No wallet, use public RPC
          const rpcEndpoints = [
            "https://eth-sepolia.public.blastapi.io",
            "https://sepolia.drpc.org",
            "https://rpc.sepolia.org",
          ];

          for (const rpc of rpcEndpoints) {
            try {
              provider = new ethers.JsonRpcProvider(rpc);
              await provider.getNetwork();
              break;
            } catch (rpcError) {
              continue;
            }
          }
        }

        if (!provider) {
          throw new Error("Failed to connect to any RPC endpoint");
        }

        const readOnlyContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CROWDFUNDING_ABI,
          provider
        );
        const campaign = await readOnlyContract.getCampaign(id);

        return {
          id: campaign.id.toString(),
          title: campaign.title,
          description: campaign.description,
          imageUrl: campaign.imageUrl,
          owner: campaign.owner,
          target: ethers.formatEther(campaign.target),
          deadline: campaign.deadline.toString(),
          amountCollected: ethers.formatEther(campaign.amountCollected),
          withdrawn: campaign.withdrawn,
        };
      }
    } catch (err) {
      console.error("Error fetching campaign:", err);
      throw err;
    }
  };

  const getDonators = async (campaignId) => {
    try {
      if (contract) {
        return await contract.getDonators(campaignId);
      } else if (typeof window !== "undefined" && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const readOnlyContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CROWDFUNDING_ABI,
          provider
        );
        const [donators, donations] = await readOnlyContract.getDonators(
          campaignId
        );

        return {
          donators,
          donations: donations.map((d) => ethers.formatEther(d)),
        };
      }
    } catch (err) {
      console.error("Error fetching donators:", err);
      throw err;
    }
  };

  // Refetch when contract changes and client is ready
  useEffect(() => {
    if (isClient && contract) {
      fetchCampaigns();
    }
  }, [contract, isClient]);

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
