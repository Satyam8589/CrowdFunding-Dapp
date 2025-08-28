import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CHAIN_ID } from "../lib/constants";
import {
  diagnoseContractIssue,
  checkContractDeployment,
  testContractConnection,
  getNetworkInfo,
} from "../lib/contractUtils";

const ContractDebugger = () => {
  const [diagnosis, setDiagnosis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [contractInfo, setContractInfo] = useState(null);

  const runDiagnosis = async () => {
    setIsLoading(true);
    try {
      const result = await diagnoseContractIssue();
      setDiagnosis(result);

      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get network info
        const netInfo = await getNetworkInfo(provider);
        setNetworkInfo(netInfo);

        // Get contract info
        const contractCheck = await checkContractDeployment(provider);
        const connectionTest = await testContractConnection(provider);

        setContractInfo({
          deployment: contractCheck,
          connection: connectionTest,
        });
      }
    } catch (error) {
      setDiagnosis({
        issue: "Failed to run diagnosis",
        error: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runDiagnosis();
  }, []);

  const getStatusColor = (status) => {
    if (status === "success" || status === true) return "text-green-600";
    if (status === "error" || status === false) return "text-red-600";
    return "text-yellow-600";
  };

  const getStatusIcon = (status) => {
    if (status === "success" || status === true) return "✅";
    if (status === "error" || status === false) return "❌";
    return "⚠️";
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Contract Debugger
        </h2>
        <p className="text-gray-600">Diagnose contract connection issues</p>
      </div>

      <button
        onClick={runDiagnosis}
        disabled={isLoading}
        className="mb-6 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg"
      >
        {isLoading ? "Running Diagnosis..." : "Re-run Diagnosis"}
      </button>

      {/* Network Information */}
      {networkInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Network Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Chain ID:</span>
              <span
                className={`ml-2 ${
                  networkInfo.chainId === CHAIN_ID.toString()
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {networkInfo.chainId}{" "}
                {networkInfo.chainId === CHAIN_ID.toString()
                  ? "✅"
                  : "❌ (Expected: " + CHAIN_ID + ")"}
              </span>
            </div>
            <div>
              <span className="font-medium">Network:</span>
              <span className="ml-2">{networkInfo.name}</span>
            </div>
            <div>
              <span className="font-medium">Block Number:</span>
              <span className="ml-2">{networkInfo.blockNumber}</span>
            </div>
          </div>
        </div>
      )}

      {/* Contract Information */}
      {contractInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Contract Information</h3>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Contract Address:</span>
              <span className="ml-2 font-mono text-sm">{CONTRACT_ADDRESS}</span>
            </div>
            <div>
              <span className="font-medium">Contract Deployed:</span>
              <span
                className={`ml-2 ${getStatusColor(
                  contractInfo.deployment.isDeployed
                )}`}
              >
                {getStatusIcon(contractInfo.deployment.isDeployed)}
                {contractInfo.deployment.isDeployed ? "Yes" : "No"}
              </span>
            </div>
            <div>
              <span className="font-medium">Contract Accessible:</span>
              <span
                className={`ml-2 ${getStatusColor(
                  contractInfo.connection.success
                )}`}
              >
                {getStatusIcon(contractInfo.connection.success)}
                {contractInfo.connection.success ? "Yes" : "No"}
              </span>
            </div>
            {contractInfo.connection.totalCampaigns !== undefined && (
              <div>
                <span className="font-medium">Total Campaigns:</span>
                <span className="ml-2">
                  {contractInfo.connection.totalCampaigns}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Diagnosis Results */}
      {diagnosis && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Diagnosis Results</h3>

          {diagnosis.status === "All checks passed" ? (
            <div className="p-4 bg-green-100 border border-green-400 rounded-lg">
              <p className="text-green-800 font-semibold">
                ✅ All systems operational!
              </p>
              <p className="text-green-700 mt-2">
                The contract is properly deployed and accessible.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {diagnosis.issue && (
                <div className="p-4 bg-red-100 border border-red-400 rounded-lg">
                  <p className="text-red-800 font-semibold">
                    ❌ Issue Detected:
                  </p>
                  <p className="text-red-700 mt-1">{diagnosis.issue}</p>
                </div>
              )}

              {diagnosis.solution && (
                <div className="p-4 bg-blue-100 border border-blue-400 rounded-lg">
                  <p className="text-blue-800 font-semibold">
                    💡 Suggested Solution:
                  </p>
                  <p className="text-blue-700 mt-1">{diagnosis.solution}</p>
                </div>
              )}

              {diagnosis.error && (
                <div className="p-4 bg-yellow-100 border border-yellow-400 rounded-lg">
                  <p className="text-yellow-800 font-semibold">
                    ⚠️ Error Details:
                  </p>
                  <p className="text-yellow-700 mt-1 font-mono text-sm">
                    {diagnosis.error}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Fixes */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Quick Fixes</h3>
        <div className="space-y-2 text-sm">
          <p>
            <strong>Wrong Network:</strong> Switch to Sepolia network in your
            wallet
          </p>
          <p>
            <strong>Contract Not Found:</strong> Check if the contract address
            is correct
          </p>
          <p>
            <strong>Connection Issues:</strong> Try refreshing the page or
            reconnecting your wallet
          </p>
          <p>
            <strong>MetaMask Issues:</strong> Clear browser cache or reset
            MetaMask connection
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContractDebugger;
