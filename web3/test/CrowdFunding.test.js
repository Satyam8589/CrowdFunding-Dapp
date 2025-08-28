const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Starting CrowdFunding contract deployment...\n");

  // Get the ContractFactory and Signers
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("📋 Deployment Details:");
  console.log("- Deploying contracts with account:", deployer.address);
  console.log("- Account balance:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  console.log("- Network:", hre.network.name);
  console.log("- Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  console.log("");

  // Deploy the CrowdFunding contract
  const CrowdFunding = await hre.ethers.getContractFactory("CrowdFunding");
  
  console.log("⏳ Deploying CrowdFunding contract...");
  const crowdFunding = await CrowdFunding.deploy();
  
  // Wait for deployment to be confirmed
  await crowdFunding.waitForDeployment();
  
  const contractAddress = await crowdFunding.getAddress();
  
  console.log("✅ CrowdFunding contract deployed successfully!");
  console.log("📍 Contract address:", contractAddress);
  console.log("👑 Admin address:", deployer.address);
  console.log("");

  // Verify initial contract state
  console.log("🔍 Verifying contract deployment...");
  const admin = await crowdFunding.admin();
  const platformFee = await crowdFunding.platformFeePercent();
  const totalCampaigns = await crowdFunding.getTotalCampaigns();
  
  console.log("- Admin:", admin);
  console.log("- Platform fee:", platformFee.toString() + "%");
  console.log("- Total campaigns:", totalCampaigns.toString());
  console.log("");

  // Save deployment info to file
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    adminAddress: deployer.address,
    blockNumber: await hre.ethers.provider.getBlockNumber(),
    timestamp: new Date().toISOString(),
    txHash: crowdFunding.deploymentTransaction().hash,
    platformFee: platformFee.toString()
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments', hre.network.name);
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info
  const deploymentFile = path.join(deploymentsDir, 'CrowdFunding.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  // Save chain ID
  const chainIdFile = path.join(deploymentsDir, '.chainId');
  fs.writeFileSync(chainIdFile, deploymentInfo.chainId);

  console.log("💾 Deployment info saved to:", deploymentFile);

  // Generate frontend config
  const frontendConfig = {
    CONTRACT_ADDRESS: contractAddress,
    ADMIN_ADDRESS: deployer.address,
    NETWORK: hre.network.name,
    CHAIN_ID: parseInt(deploymentInfo.chainId),
    PLATFORM_FEE: parseInt(platformFee.toString())
  };

  const configDir = path.join(__dirname, '..', '..', 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  const frontendConfigFile = path.join(configDir, 'contract-config.json');
  fs.writeFileSync(frontendConfigFile, JSON.stringify(frontendConfig, null, 2));
  
  console.log("⚙️  Frontend config saved to:", frontendConfigFile);
  console.log("");

  // Display next steps
  console.log("🎉 Deployment completed successfully!");
  console.log("");
  console.log("📝 Next steps:");
  console.log("1. Update your frontend .env.local file with:");
  console.log(`   NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`   NEXT_PUBLIC_ADMIN_ADDRESS=${deployer.address}`);
  console.log("");
  console.log("2. If deploying to testnet/mainnet, verify the contract:");
  console.log(`   npx hardhat verify --network ${hre.network.name} ${contractAddress}`);
  console.log("");
  console.log("3. Start your frontend application and begin creating campaigns!");
  console.log("");

  // Additional network-specific instructions
  if (hre.network.name === "localhost" || hre.network.name === "hardhat") {
    console.log("🔧 Local Development:");
    console.log("- Keep your Hardhat node running");
    console.log("- Connect MetaMask to localhost:8545");
    console.log("- Import test accounts for testing");
  } else {
    console.log("🌐 Testnet/Mainnet:");
    console.log("- Add network to your wallet if needed");
    console.log("- Ensure you have enough native tokens for transactions");
    console.log("- Consider setting up a frontend domain");
  }
}

// Execute deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });