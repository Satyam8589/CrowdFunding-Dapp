// Campaign type definition
export const CampaignType = {
  id: "number",
  title: "string",
  description: "string",
  imageUrl: "string",
  owner: "string",
  target: "string",
  deadline: "number",
  amountCollected: "string",
  withdrawn: "boolean",
  donators: "array",
  donations: "array",
};

// Form validation types
export const CreateCampaignFormType = {
  title: "string",
  description: "string",
  target: "string",
  deadline: "string",
  imageUrl: "string",
};

// Contribution form type
export const ContributeFormType = {
  amount: "string",
};

// Wallet connection states
export const WalletState = {
  CONNECTED: "connected",
  CONNECTING: "connecting",
  DISCONNECTED: "disconnected",
  ERROR: "error",
};
