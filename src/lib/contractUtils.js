import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CROWDFUNDING_ABI } from "./constants";

/**
 * Utility functions for contract interaction and debugging
 */

export const checkContractDeployment = async (provider) => {
  try {
    // Check if there's code at the contract address
    const code = await provider.getCode(CONTRACT_ADDRESS);

    if (code === "0x") {
      console.error("No contract found at address:", CONTRACT_ADDRESS);
      return {
        isDeployed: false,
        error: "Contract not deployed at the specified address",
      };
    }

    console.log("Contract found at address:", CONTRACT_ADDRESS);
    return {
      isDeployed: true,
      contractAddress: CONTRACT_ADDRESS,
    };
  } catch (error) {
    console.error("Error checking contract deployment:", error);
    return {
      isDeployed: false,
      error: error.message,
    };
  }
};

export const testContractConnection = async (provider) => {
  try {
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CROWDFUNDING_ABI,
      provider
    );

    // Test basic contract functions
    console.log("Testing contract connection...");

    try {
      const totalCampaigns = await contract.getTotalCampaigns();
      console.log("Total campaigns:", totalCampaigns.toString());

      return {
        success: true,
        totalCampaigns: totalCampaigns.toString(),
      };
    } catch (callError) {
      console.error("Error calling getTotalCampaigns:", callError);

      // Try alternative methods to debug
      try {
        const admin = await contract.admin();
        console.log("Contract admin:", admin);
        return {
          success: true,
          admin: admin,
          note: "getTotalCampaigns failed but admin() worked",
        };
      } catch (adminError) {
        console.error("Error calling admin():", adminError);
        return {
          success: false,
          error: "Contract methods are not accessible",
          details: callError.message,
        };
      }
    }
  } catch (error) {
    console.error("Error creating contract instance:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const getNetworkInfo = async (provider) => {
  try {
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    return {
      chainId: network.chainId.toString(),
      name: network.name,
      blockNumber: blockNumber.toString(),
    };
  } catch (error) {
    console.error("Error getting network info:", error);
    return {
      error: error.message,
    };
  }
};

export const diagnoseContractIssue = async (allowNetworkMismatch = false) => {
  try {
    if (!window.ethereum) {
      return {
        issue: "No Web3 provider found",
        solution: "Please install MetaMask or another Web3 wallet",
      };
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    // Check network
    const networkInfo = await getNetworkInfo(provider);
    console.log("Network info:", networkInfo);

    // Check if we're on the right network (but allow browsing on wrong network)
    if (networkInfo.chainId !== "11155111") {
      if (!allowNetworkMismatch) {
        return {
          issue: `Wrong network. Expected Sepolia (11155111), got ${networkInfo.chainId}`,
          solution: "Switch to Sepolia network in your wallet",
        };
      } else {
        console.log(
          `Network mismatch allowed for browsing: ${networkInfo.chainId} vs 11155111`
        );
        // For browsing, use public RPC to check contract instead
        const publicRpcEndpoints = [
          "https://eth-sepolia.public.blastapi.io",
          "https://sepolia.drpc.org",
          "https://rpc.sepolia.org",
        ];

        let publicProvider;
        for (const rpc of publicRpcEndpoints) {
          try {
            publicProvider = new ethers.JsonRpcProvider(rpc);
            await publicProvider.getNetwork();
            break;
          } catch (error) {
            continue;
          }
        }

        if (publicProvider) {
          provider = publicProvider; // Use public provider for contract checks
        } else {
          return {
            issue:
              "Cannot connect to Sepolia network for contract verification",
            solution: "Try again later or switch to Sepolia network",
          };
        }
      }
    }

    // Check contract deployment
    const deploymentCheck = await checkContractDeployment(provider);
    console.log("Deployment check:", deploymentCheck);

    if (!deploymentCheck.isDeployed) {
      return {
        issue: deploymentCheck.error,
        solution:
          "Deploy the contract to Sepolia network or update the contract address",
      };
    }

    // Test contract connection
    const connectionTest = await testContractConnection(provider);
    console.log("Connection test:", connectionTest);

    if (!connectionTest.success) {
      return {
        issue: connectionTest.error,
        solution:
          "Check if the ABI matches the deployed contract or if the contract is functioning properly",
      };
    }

    return {
      status: "All checks passed",
      details: connectionTest,
    };
  } catch (error) {
    console.error("Error in diagnosis:", error);
    return {
      issue: "Unexpected error during diagnosis",
      error: error.message,
    };
  }
};
