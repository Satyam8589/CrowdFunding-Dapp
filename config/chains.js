import { sepolia, mainnet } from "wagmi/chains";

export const supportedChains = [sepolia, mainnet];

export const defaultChain = sepolia;

export const getChainById = (chainId) => {
  return supportedChains.find((chain) => chain.id === chainId) || defaultChain;
};

export const isChainSupported = (chainId) => {
  return supportedChains.some((chain) => chain.id === chainId);
};
