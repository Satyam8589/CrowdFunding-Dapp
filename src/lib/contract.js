import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI } from "./constants";
import { formatEther } from "./utils";

export class ContractService {
  constructor(signer) {
    this.signer = signer;
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CROWDFUNDING_ABI,
      signer
    );
  }

  async createCampaign(
    title,
    description,
    imageUrl,
    target,
    deadlineTimestamp
  ) {
    try {
      console.log("🔍 DEBUG: ContractService.createCampaign called with:", {
        title,
        description,
        imageUrl,
        target,
        deadlineTimestamp,
        deadlineTimestampType: typeof deadlineTimestamp,
      });

      const targetInWei = ethers.parseEther(target.toString());

      // deadlineTimestamp should already be a Unix timestamp
      const finalDeadlineTimestamp =
        typeof deadlineTimestamp === "number"
          ? deadlineTimestamp
          : Math.floor(new Date(deadlineTimestamp).getTime() / 1000);

      console.log("🔍 DEBUG: Final values for contract call:", {
        targetInWei: targetInWei.toString(),
        finalDeadlineTimestamp,
      });

      const tx = await this.contract.createCampaign(
        title,
        description,
        imageUrl,
        targetInWei,
        finalDeadlineTimestamp
      );

      return await tx.wait();
    } catch (error) {
      console.error("Error creating campaign:", error);
      throw error;
    }
  }

  async donateToCampaign(campaignId, amount) {
    try {
      console.log("ContractService.donateToCampaign called with:", {
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

      const amountInWei = ethers.parseEther(cleanAmount);

      console.log("ContractService donating:", {
        campaignId,
        originalAmount: amount,
        cleanAmount,
        numericAmount,
        amountInWei: amountInWei.toString(),
      });

      const tx = await this.contract.donateToCampaign(campaignId, {
        value: amountInWei,
      });

      return await tx.wait();
    } catch (error) {
      // Check if user rejected the transaction
      const errorMessage = error.message || error.toString() || "";
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
        error.code === 4001 || // MetaMask rejection code
        error.code === "ACTION_REJECTED"; // ethers.js rejection code

      // Only log actual errors, not user rejections
      if (!isUserRejection) {
        console.error("Error donating to campaign:", error);
      }

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
        target: formatEther(campaign.target),
        deadline: campaign.deadline.toString(),
        amountCollected: formatEther(campaign.amountCollected),
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
        donations: donations.map((d) => formatEther(d)),
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
