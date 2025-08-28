import {
  useAccount,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { useState, useEffect } from "react";
import { CHAIN_ID } from "../lib/constants";

export const useWallet = () => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(null); // null initially to indicate loading

  useEffect(() => {
    if (chainId) {
      setIsCorrectNetwork(chainId === CHAIN_ID);
    }
  }, [chainId]);

  const connectWallet = async (connector) => {
    try {
      await connect({ connector });
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const disconnectWallet = () => {
    disconnect();
  };

  const switchToCorrectNetwork = async () => {
    try {
      await switchChain({ chainId: CHAIN_ID });
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    chainId,
    isCorrectNetwork,
    connectors,
    connectError,
    connectWallet,
    disconnectWallet,
    switchToCorrectNetwork,
  };
};
