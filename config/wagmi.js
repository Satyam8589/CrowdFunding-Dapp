import { createConfig, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import {
  injected,
  metaMask,
  walletConnect,
  coinbaseWallet,
} from "wagmi/connectors";

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [
    // Injected connector for mobile wallet apps with better detection
    injected({
      target: {
        id: "injected",
        name: "Browser Wallet",
        provider: typeof window !== "undefined" ? window.ethereum : undefined,
      },
    }),
    // MetaMask connector
    metaMask({
      dappMetadata: {
        name: "CrowdFunding DApp",
        url: typeof window !== "undefined" ? window.location.origin : "",
      },
    }),
    // WalletConnect for mobile wallets
    walletConnect({
      projectId,
      metadata: {
        name: "CrowdFunding DApp",
        description: "Decentralized Crowdfunding Platform",
        url: typeof window !== "undefined" ? window.location.origin : "",
        icons: [
          `${
            typeof window !== "undefined" ? window.location.origin : ""
          }/icons/logo.svg`,
        ],
      },
      showQrModal: true,
    }),
    // Coinbase Wallet
    coinbaseWallet({
      appName: "CrowdFunding DApp",
      appLogoUrl: `${
        typeof window !== "undefined" ? window.location.origin : ""
      }/icons/logo.svg`,
    }),
  ],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
    ),
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com"
    ),
  },
});
