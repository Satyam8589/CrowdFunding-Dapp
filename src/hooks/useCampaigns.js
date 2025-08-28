import { useState, useEffect } from "react";
import { useContract } from "./useContract";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI } from "../lib/constants";

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { contract } = useContract();

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (contract) {
        const campaignsData = await contract.getAllCampaigns();
        setCampaigns(campaignsData);
      } else if (window.ethereum) {
        // Fallback to read-only contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const readOnlyContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          CROWDFUNDING_ABI,
          provider
        );

        // Use getTotalCampaigns instead of getCampaignCount
        const campaignCount = await readOnlyContract.getTotalCampaigns();
        const campaignsData = [];

        for (let i = 0; i < campaignCount; i++) {
          try {
            const campaign = await readOnlyContract.getCampaign(i);
            // The campaign is returned as a struct, not a tuple
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
          } catch (error) {
            console.error(`Error fetching campaign ${i}:`, error);
          }
        }

        setCampaigns(campaignsData);
      }
    } catch (err) {
      console.error("Error fetching campaigns:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCampaignById = async (id) => {
    try {
      if (contract) {
        return await contract.getCampaign(id);
      } else if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
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
      } else if (window.ethereum) {
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

  useEffect(() => {
    fetchCampaigns();
  }, [contract]);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    getCampaignById,
    getDonators,
  };
};
