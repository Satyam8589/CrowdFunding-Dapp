import { createConfig, http } from "wagmi";
import { sepolia, mainnet } from "wagmi/chains";
import { injected, metaMask, walletConnect } from "wagmi/connectors";

const projectId =
  process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "your-project-id";

export const config = createConfig({
  chains: [sepolia, mainnet],
  connectors: [injected(), metaMask(), walletConnect({ projectId })],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://rpc.sepolia.org"
    ),
    [mainnet.id]: http(
      process.env.NEXT_PUBLIC_MAINNET_RPC_URL || "https://eth.llamarpc.com"
    ),
  },
});
