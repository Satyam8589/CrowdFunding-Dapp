# 🌟 CrowdFunding DApp - Decentralized Crowdfunding Platform

![CrowdFunding DApp](https://github.com/Satyam8589/CrowdFunding-Dapp/blob/main/Screenshot%202025-08-29%20022017.png?raw=true)

A modern, decentralized crowdfunding platform built on Ethereum blockchain that enables transparent, secure, and trustless fundraising campaigns with beautiful UI/UX design.

## ✨ Features

### 🚀 Core Functionality

- **Create Campaigns**: Launch fundraising campaigns with detailed descriptions and images
- **Smart Donations**: Contribute to campaigns securely through blockchain transactions
- **Real-time Updates**: Live tracking of campaign progress and recent backers
- **Transparent Withdrawals**: Campaign owners can withdraw funds after successful funding
- **Platform Fee**: Sustainable 1% platform fee for development and maintenance

### 🎨 Modern UI/UX

- **Glass Morphism Design**: Beautiful gradient backgrounds with backdrop blur effects
- **Responsive Layout**: Optimized for desktop, tablet, and mobile devices
- **Interactive Components**: Smooth animations and hover effects
- **Dark Mode Ready**: Professional gradient color schemes
- **Real-time Data**: Auto-refreshing campaign statistics and recent backers

### 🔐 Security & Trust

- **Smart Contract Security**: Thoroughly tested Solidity contracts
- **Wallet Integration**: Seamless connection with MetaMask and other Web3 wallets
- **Network Validation**: Automatic network switching for optimal user experience
- **Error Handling**: Comprehensive error management and user feedback

## 🛠️ Technology Stack

### Frontend

- **Framework**: Next.js 15.5.2 with React 19
- **Styling**: Tailwind CSS 4 with custom gradients
- **State Management**: TanStack Query for server state
- **Blockchain Integration**: ethers.js 6.15.0 + Wagmi 2.16.8
- **Image Storage**: Pinata IPFS integration
- **Icons**: Lucide React for consistent iconography

### Backend & Blockchain

- **Smart Contracts**: Solidity ^0.8.19
- **Development Framework**: Hardhat with comprehensive tooling
- **Testing**: Chai + Hardhat testing suite
- **Deployment**: Multi-network support (Sepolia, Polygon, BSC)
- **Verification**: Automatic contract verification on Etherscan

### Development Tools

- **Linting**: ESLint with Next.js configuration
- **Version Control**: Git with professional commit structure
- **Package Management**: npm with optimized dependencies
- **Environment**: Node.js with ES6+ features

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MetaMask or compatible Web3 wallet
- Git

### Project Structure

CrowdFunding-Dapp/
├── src/
│   ├── app/                      # Next.js 13+ app directory
│   │   ├── campaigns/           # Campaign-related pages
│   │   ├── about/              # About page
│   │   └── api/                # API routes
│   ├── components/             # Reusable React components
│   │   ├── CampaignCard.jsx    # Campaign display component
│   │   ├── CampaignForm.jsx    # Campaign creation form
│   │   ├── ContributeForm.jsx  # Donation interface
│   │   └── Header.jsx          # Navigation header
│   ├── hooks/                  # Custom React hooks
│   │   ├── useCampaigns.js     # Campaign data management
│   │   ├── useContract.js      # Smart contract integration
│   │   └── useWallet.js        # Wallet connection logic
│   ├── lib/                    # Utility libraries
│   │   ├── contract.js         # Contract service layer
│   │   ├── utils.js            # Helper functions
│   │   └── imageUtils.js       # IPFS image handling
│   └── types/                  # TypeScript type definitions
├── web3/                       # Smart contract workspace
│   ├── contracts/              # Solidity smart contracts
│   ├── scripts/                # Deployment scripts
│   ├── test/                   # Contract tests
│   └── hardhat.config.js       # Hardhat configuration
├── config/                     # Configuration files
│   ├── wagmi.js               # Wagmi Web3 configuration
│   └── chains.js              # Blockchain network configs
└── public/                     # Static assets
    ├── icons/                 # Application icons
    └── images/                # Image assets
```

## 🎯 Key Features Explained

### Campaign Management

- **Creation**: Users can create campaigns with title, description, target amount, deadline, and images
- **Validation**: Smart contract ensures all parameters are valid before creation
- **Status Tracking**: Real-time monitoring of funding progress and time remaining

### Donation System

- **Secure Transactions**: All donations are processed through smart contracts
- **Real-time Updates**: Immediate reflection of donations in UI
- **Backer History**: Track of all campaign supporters with amounts

### Fund Withdrawal

- **Owner-only Access**: Only campaign creators can withdraw funds
- **Platform Fee**: Transparent 1% fee for platform sustainability
- **Security Checks**: Multiple validations before fund transfer

## 🔧 Available Scripts

### Frontend

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Smart Contracts

```bash
npm run compile      # Compile smart contracts
npm run test         # Run contract tests
npm run test:gas     # Run tests with gas reporting
npm run deploy:sepolia  # Deploy to Sepolia testnet
npm run verify:sepolia  # Verify contracts on Etherscan
```

## 🌐 Supported Networks

- **Ethereum Mainnet**: Production deployment
- **Sepolia Testnet**: Primary testing network
- **Polygon Mainnet**: Layer 2 scaling solution
- **BSC Testnet**: Binance Smart Chain testing
- **Local Network**: Hardhat local development

## 🚀 Deployment

### Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Satyam8589/CrowdFunding-Dapp)

## 🙏 Acknowledgments

- **OpenZeppelin**: For secure smart contract libraries
- **Hardhat**: For excellent development framework
- **Next.js**: For amazing React framework
- **Tailwind CSS**: For utility-first CSS framework
- **ethers.js**: For Ethereum library
- **Pinata**: For IPFS storage solution

## 📞 Support & Contact

- **GitHub Issues**: [Report bugs or request features](https://github.com/Satyam8589/CrowdFunding-Dapp/issues)
- **Developer**: [@Satyam8589](https://github.com/Satyam8589)

## 🚀 Roadmap

- [ ] Multi-token support (ERC-20 tokens)
- [ ] Campaign categories and filtering
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Integration with other blockchains
- [ ] NFT rewards for backers
- [ ] Social features and campaign sharing

---

<div align="center">
  <p><strong>Built with ❤️ for the decentralized future</strong></p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
