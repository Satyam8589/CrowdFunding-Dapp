import contractConfig from "../../config/contract-config.json";

export const CONTRACT_ADDRESS = contractConfig.CONTRACT_ADDRESS;
export const ADMIN_ADDRESS = contractConfig.ADMIN_ADDRESS;
export const NETWORK = contractConfig.NETWORK;
export const CHAIN_ID = contractConfig.CHAIN_ID;
export const PLATFORM_FEE = contractConfig.PLATFORM_FEE;

export const CROWDFUNDING_ABI = [
  "function createCampaign(string memory _title, string memory _description, string memory _imageUrl, uint256 _target, uint256 _deadline) public returns (uint256)",
  "function donateToCampaign(uint256 _id) public payable",
  "function withdrawFunds(uint256 _id) public",
  "function getCampaign(uint256 _id) public view returns (tuple(uint256 id, string title, string description, string imageUrl, address owner, uint256 target, uint256 deadline, uint256 amountCollected, bool withdrawn, address[] donators, uint256[] donations))",
  "function getAllCampaigns() public view returns (tuple(uint256 id, string title, string description, string imageUrl, address owner, uint256 target, uint256 deadline, uint256 amountCollected, bool withdrawn, address[] donators, uint256[] donations)[])",
  "function getDonators(uint256 _id) public view returns (address[] memory, uint256[] memory)",
  "function getTotalCampaigns() public view returns (uint256)",
  "function campaignCounter() public view returns (uint256)",
  "function admin() public view returns (address)",
  "function platformFeePercent() public view returns (uint256)",
  "function isCampaignEnded(uint256 _id) public view returns (bool)",
  "function getCampaignProgress(uint256 _id) public view returns (uint256)",
  "event CampaignCreated(uint256 indexed campaignId, address indexed owner, string title, uint256 target, uint256 deadline)",
  "event DonationMade(uint256 indexed campaignId, address indexed donator, uint256 amount)",
  "event FundsWithdrawn(uint256 indexed campaignId, address indexed owner, uint256 amount, uint256 platformFee)",
];

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export const PAGINATION = {
  CAMPAIGNS_PER_PAGE: 12,
  INITIAL_PAGE: 1,
};

export const CAMPAIGN_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  COMPLETED: "completed",
  WITHDRAWN: "withdrawn",
};
