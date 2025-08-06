// backend/ignition/modules/CrowdfundingPlatform.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const CrowdfundingPlatformModule = buildModule("CrowdfundingPlatformModule", (m) => {
  // Deploy the CrowdfundingPlatform contract
  const crowdfundingPlatform = m.contract("CrowdfundingPlatform");

  return { crowdfundingPlatform };
});

module.exports = CrowdfundingPlatformModule;