const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function verifyDeployment() {
  try {
    console.log("🔍 Verifying contract deployment...");

    // Read the deployment file
    const deploymentPath = path.join(
      __dirname,
      "../deployments/sepolia/CrowdFunding.json"
    );

    if (!fs.existsSync(deploymentPath)) {
      console.error("❌ Deployment file not found at:", deploymentPath);
      return false;
    }

    const deploymentData = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
    console.log("📄 Found deployment data:");
    console.log("   - Contract Address:", deploymentData.contractAddress);
    console.log("   - Block Number:", deploymentData.blockNumber);
    console.log("   - Timestamp:", deploymentData.timestamp);

    // Connect to the network
    const provider = new ethers.JsonRpcProvider(
      process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
    );

    // Check if there's code at the contract address
    const code = await provider.getCode(deploymentData.contractAddress);

    if (code === "0x") {
      console.error(
        "❌ No contract code found at address:",
        deploymentData.contractAddress
      );
      return false;
    }

    console.log("✅ Contract code found at address");

    // Load the contract ABI
    const artifactPath = path.join(
      __dirname,
      "../artifacts/contracts/CrowdFunding.sol/CrowdFunding.json"
    );
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    // Create contract instance
    const contract = new ethers.Contract(
      deploymentData.contractAddress,
      artifact.abi,
      provider
    );

    // Test basic contract functions
    console.log("🧪 Testing contract functions...");

    try {
      const admin = await contract.admin();
      console.log("✅ Admin address:", admin);

      const totalCampaigns = await contract.getTotalCampaigns();
      console.log("✅ Total campaigns:", totalCampaigns.toString());

      const platformFee = await contract.platformFeePercent();
      console.log("✅ Platform fee:", platformFee.toString() + "%");

      // Update frontend config
      const configPath = path.join(
        __dirname,
        "../../config/contract-config.json"
      );
      const config = {
        CONTRACT_ADDRESS: deploymentData.contractAddress,
        ADMIN_ADDRESS: admin,
        NETWORK: "sepolia",
        CHAIN_ID: 11155111,
        PLATFORM_FEE: parseInt(platformFee.toString()),
      };

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      console.log("✅ Updated frontend config at:", configPath);

      console.log("🎉 Contract verification successful!");
      return true;
    } catch (callError) {
      console.error("❌ Error calling contract functions:", callError.message);
      return false;
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);
    return false;
  }
}

async function main() {
  const isValid = await verifyDeployment();
  process.exit(isValid ? 0 : 1);
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { verifyDeployment };
