const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function deployContract() {
  console.log("🚀 Starting contract deployment...");

  try {
    // Get the contract factory
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");

    // Deploy the contract
    console.log("📝 Deploying CrowdFunding contract...");
    const crowdFunding = await CrowdFunding.deploy();

    console.log("⏳ Waiting for deployment transaction...");
    await crowdFunding.waitForDeployment();

    const contractAddress = await crowdFunding.getAddress();
    const deploymentTx = crowdFunding.deploymentTransaction();

    console.log("✅ Contract deployed successfully!");
    console.log("   - Address:", contractAddress);
    console.log("   - Transaction hash:", deploymentTx.hash);
    console.log("   - Block number:", deploymentTx.blockNumber);

    // Wait for a few confirmations
    console.log("⏳ Waiting for confirmations...");
    await deploymentTx.wait(3);

    // Get admin address
    const admin = await crowdFunding.admin();
    const platformFee = await crowdFunding.platformFeePercent();

    // Save deployment info
    const deploymentInfo = {
      network: "sepolia",
      chainId: "11155111",
      contractAddress: contractAddress,
      adminAddress: admin,
      blockNumber: deploymentTx.blockNumber,
      timestamp: new Date().toISOString(),
      txHash: deploymentTx.hash,
      platformFee: platformFee.toString(),
    };

    // Create deployments directory if it doesn't exist
    const deploymentsDir = path.join(__dirname, "../deployments/sepolia");
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // Save deployment info
    const deploymentPath = path.join(deploymentsDir, "CrowdFunding.json");
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log("💾 Deployment info saved to:", deploymentPath);

    // Update frontend config
    const configPath = path.join(
      __dirname,
      "../../config/contract-config.json"
    );
    const config = {
      CONTRACT_ADDRESS: contractAddress,
      ADMIN_ADDRESS: admin,
      NETWORK: "sepolia",
      CHAIN_ID: 11155111,
      PLATFORM_FEE: parseInt(platformFee.toString()),
    };

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log("🔧 Frontend config updated at:", configPath);

    // Test the deployed contract
    console.log("🧪 Testing deployed contract...");
    const totalCampaigns = await crowdFunding.getTotalCampaigns();
    console.log("   - Total campaigns:", totalCampaigns.toString());
    console.log("   - Admin:", admin);
    console.log("   - Platform fee:", platformFee.toString() + "%");

    console.log("🎉 Deployment completed successfully!");

    return {
      address: contractAddress,
      admin: admin,
      txHash: deploymentTx.hash,
    };
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

async function main() {
  try {
    const result = await deployContract();
    console.log("\n📋 Summary:");
    console.log("   Contract Address:", result.address);
    console.log("   Admin Address:", result.admin);
    console.log("   Transaction Hash:", result.txHash);
  } catch (error) {
    console.error("Deployment failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deployContract };
