// Import Hardhat plugins
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-dependency-compiler");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",

  // ✅ Dependency Compiler (e.g., OpenZeppelin)
  dependencyCompiler: {
    paths: [
      "@openzeppelin/contracts/utils/ReentrancyGuard.sol"
    ],
  },

  // ✅ Network config
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
  },

  // ✅ Etherscan verification config
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    },
  },
};
