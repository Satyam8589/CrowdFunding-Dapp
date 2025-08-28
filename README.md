# CrowdFunding DApp

A decentralized crowdfunding platform built with Next.js, Ethereum, and smart contracts.

## 🚀 Live Demo

[Deploy your own](#deployment)

## ✨ Features

- 🔗 Web3 wallet connection (MetaMask, WalletConnect)
- 💰 Create and fund campaigns
- 🏦 Smart contract integration
- 📱 Responsive design
- 🎯 Campaign progress tracking
- 💸 Secure fund withdrawal
- 🖼️ IPFS image storage

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Blockchain**: Ethereum, Solidity, Hardhat
- **Web3**: Wagmi, Viem, Ethers.js
- **Storage**: IPFS (Pinata, Web3.Storage)
- **Deployment**: Vercel

## 🚀 Deployment

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/crowdfunding-dapp)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
PINATA_JWT=your_pinata_jwt
WEB3_STORAGE_TOKEN=your_web3_storage_token
```

### Build Commands

```bash
npm install
npm run build
npm start
```

## 📱 Usage

1. Connect your Web3 wallet
2. Browse existing campaigns
3. Create new campaigns
4. Contribute to campaigns
5. Withdraw funds (campaign creators)

## 🔗 Smart Contract

The smart contract is deployed on Ethereum Sepolia testnet. View the contract code in `/web3/contracts/CrowdFunding.sol`.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License
