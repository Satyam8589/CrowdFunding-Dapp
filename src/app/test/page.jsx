"use client";

import { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  CROWDFUNDING_ABI,
  CHAIN_ID,
} from "../../lib/constants";
import ContractDebugger from "../../components/ContractDebugger";

export default function TestPage() {
  const [contractData, setContractData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testContract = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!window.ethereum) {
        throw new Error("No Web3 provider found");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      console.log("Network:", network);
      console.log("Expected Chain ID:", CHAIN_ID);
      console.log("Current Chain ID:", network.chainId.toString());

      if (network.chainId.toString() !== CHAIN_ID.toString()) {
        throw new Error(
          `Wrong network. Expected ${CHAIN_ID}, got ${network.chainId}`
        );
      }

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CROWDFUNDING_ABI,
        provider
      );

      console.log("Contract instance created");

      // Test contract calls
      const totalCampaigns = await contract.getTotalCampaigns();
      const admin = await contract.admin();
      const platformFee = await contract.platformFeePercent();

      console.log("Contract calls successful");

      // If we have campaigns, get the first one
      let firstCampaign = null;
      if (totalCampaigns > 0) {
        try {
          firstCampaign = await contract.getCampaign(0);
        } catch (campaignError) {
          console.error("Error getting first campaign:", campaignError);
        }
      }

      setContractData({
        network: {
          chainId: network.chainId.toString(),
          name: network.name,
        },
        contract: {
          address: CONTRACT_ADDRESS,
          totalCampaigns: totalCampaigns.toString(),
          admin: admin,
          platformFee: platformFee.toString(),
        },
        firstCampaign: firstCampaign
          ? {
              id: firstCampaign.id.toString(),
              title: firstCampaign.title,
              owner: firstCampaign.owner,
              target: ethers.formatEther(firstCampaign.target),
              amountCollected: ethers.formatEther(
                firstCampaign.amountCollected
              ),
            }
          : null,
      });
    } catch (err) {
      console.error("Test failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testContract();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Contract Connectivity Test</h1>

      <div className="mb-6">
        <button
          onClick={testContract}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-6 py-3 rounded-lg"
        >
          {loading ? "Testing..." : "Test Contract"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-2">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {contractData && (
        <div className="mb-6 p-6 bg-green-100 border border-green-400 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-4">
            ✅ Contract Test Successful!
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">
                Network Info:
              </h4>
              <ul className="text-green-600 space-y-1">
                <li>
                  <strong>Chain ID:</strong> {contractData.network.chainId}
                </li>
                <li>
                  <strong>Network:</strong> {contractData.network.name}
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-green-700 mb-2">
                Contract Info:
              </h4>
              <ul className="text-green-600 space-y-1">
                <li>
                  <strong>Address:</strong> {contractData.contract.address}
                </li>
                <li>
                  <strong>Total Campaigns:</strong>{" "}
                  {contractData.contract.totalCampaigns}
                </li>
                <li>
                  <strong>Admin:</strong> {contractData.contract.admin}
                </li>
                <li>
                  <strong>Platform Fee:</strong>{" "}
                  {contractData.contract.platformFee}%
                </li>
              </ul>
            </div>
          </div>

          {contractData.firstCampaign && (
            <div className="mt-4">
              <h4 className="font-semibold text-green-700 mb-2">
                First Campaign:
              </h4>
              <ul className="text-green-600 space-y-1">
                <li>
                  <strong>ID:</strong> {contractData.firstCampaign.id}
                </li>
                <li>
                  <strong>Title:</strong> {contractData.firstCampaign.title}
                </li>
                <li>
                  <strong>Owner:</strong> {contractData.firstCampaign.owner}
                </li>
                <li>
                  <strong>Target:</strong> {contractData.firstCampaign.target}{" "}
                  ETH
                </li>
                <li>
                  <strong>Collected:</strong>{" "}
                  {contractData.firstCampaign.amountCollected} ETH
                </li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Contract Debugger</h2>
        <ContractDebugger />
      </div>
    </div>
  );
}
