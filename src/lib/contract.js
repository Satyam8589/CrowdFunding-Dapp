import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI } from "./constants";

export class ContractService {
  constructor(signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CROWDFUNDING_ABI,
      signer
    );
  }

  async createCampaign(title, description, imageUrl, target, deadline) {
    try {
      const targetInWei = ethers.parseEther(target.toString());
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);

      const tx = await this.contract.createCampaign(
        title,
        description,
        imageUrl,
        targetInWei,
        deadlineTimestamp
      );

      return await tx.wait();
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  }

  async donateToCampaign(campaignId, amount) {
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await this.contract.donateToCampaign(campaignId, {
        value: amountInWei,
      });

      return await tx.wait();
    } catch (error) {
      console.error("Error donating to campaign:", error);
      throw error;
    }
  }

  async withdrawFunds(campaignId) {
    try {
      const tx = await this.contract.withdrawFunds(campaignId);
      return await tx.wait();
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      throw error;
    }
  }

  async getCampaign(campaignId) {
    try {
      const campaign = await this.contract.getCampaign(campaignId);
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
    } catch (error) {
      console.error("Error getting campaign:", error);
      throw error;
    }
  }

  async getAllCampaigns() {
    try {
      const campaignCount = await this.contract.getTotalCampaigns();
      const campaigns = [];

      for (let i = 0; i < campaignCount; i++) {
        try {
          const campaign = await this.getCampaign(i);
          campaigns.push(campaign);
        } catch (error) {
          console.error(`Error fetching campaign ${i}:`, error);
        }
      }

      return campaigns;
    } catch (error) {
      console.error("Error getting all campaigns:", error);
      throw error;
    }
  }

  async getDonators(campaignId) {
    try {
      const [donators, donations] = await this.contract.getDonators(campaignId);
      return {
        donators,
        donations: donations.map((d) => ethers.formatEther(d)),
      };
    } catch (error) {
      console.error("Error getting donators:", error);
      throw error;
    }
  }
}

export const getContractInstance = (signer) => {
  return new ContractService(signer);
};
