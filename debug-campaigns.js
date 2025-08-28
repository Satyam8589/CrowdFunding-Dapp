const { ethers } = require("ethers");

// Contract configuration
const CONTRACT_ADDRESS = "0x4c672F0b9290E3e823a43C3cBf2927Bba8a5e4f1";
const CROWDFUNDING_ABI = [
  "function getAllCampaigns() public view returns (tuple(uint256 id, string title, string description, string imageUrl, address owner, uint256 target, uint256 deadline, uint256 amountCollected, bool withdrawn, address[] donators, uint256[] donations)[])",
  "function getTotalCampaigns() public view returns (uint256)",
  "function getCampaign(uint256 _id) public view returns (tuple(uint256 id, string title, string description, string imageUrl, address owner, uint256 target, uint256 deadline, uint256 amountCollected, bool withdrawn, address[] donators, uint256[] donations))",
];

async function testCampaignsFetch() {
  console.log("🔍 Testing campaign fetch from frontend...");

  try {
    // Use public RPC provider - try multiple endpoints
    let provider;
    const rpcEndpoints = [
      "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "https://eth-sepolia.public.blastapi.io",
      "https://rpc.sepolia.org",
      "https://sepolia.drpc.org",
    ];

    for (const rpc of rpcEndpoints) {
      try {
        console.log(`🔗 Trying RPC: ${rpc}`);
        provider = new ethers.JsonRpcProvider(rpc);
        await provider.getNetwork(); // Test connection
        console.log("✅ Provider connected");
        break;
      } catch (rpcError) {
        console.log(`❌ Failed to connect to ${rpc}: ${rpcError.message}`);
        continue;
      }
    }

    if (!provider) {
      throw new Error("All RPC endpoints failed");
    }

    // Create contract instance
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CROWDFUNDING_ABI,
      provider
    );
    console.log("✅ Contract instance created");

    // Test getTotalCampaigns
    const totalCampaigns = await contract.getTotalCampaigns();
    console.log(`📊 Total campaigns: ${totalCampaigns.toString()}`);

    if (totalCampaigns > 0) {
      console.log("🔍 Fetching all campaigns...");

      // Test getAllCampaigns
      try {
        const allCampaigns = await contract.getAllCampaigns();
        console.log(
          `✅ Successfully fetched ${allCampaigns.length} campaigns using getAllCampaigns()`
        );

        allCampaigns.forEach((campaign, index) => {
          console.log(`Campaign ${index}:`, {
            id: campaign.id.toString(),
            title: campaign.title,
            target: ethers.formatEther(campaign.target),
            collected: ethers.formatEther(campaign.amountCollected),
          });
        });
      } catch (getAllError) {
        console.error("❌ getAllCampaigns failed:", getAllError.message);

        // Fallback: Fetch campaigns individually
        console.log("🔄 Trying individual campaign fetch...");
        for (let i = 0; i < totalCampaigns; i++) {
          try {
            const campaign = await contract.getCampaign(i);
            console.log(`Campaign ${i}:`, {
              id: campaign.id.toString(),
              title: campaign.title,
              target: ethers.formatEther(campaign.target),
              collected: ethers.formatEther(campaign.amountCollected),
            });
          } catch (getCampaignError) {
            console.error(
              `❌ Failed to fetch campaign ${i}:`,
              getCampaignError.message
            );
          }
        }
      }
    } else {
      console.log("📭 No campaigns found");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error("Stack:", error.stack);
  }
}

testCampaignsFetch();
