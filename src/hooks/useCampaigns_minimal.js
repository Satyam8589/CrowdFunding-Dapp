import { useState, useEffect } from "react";

export const useCampaigns = () => {
  const [campaigns] = useState([]);
  const [isLoading] = useState(false);
  const [error] = useState(null);

  return {
    campaigns,
    isLoading,
    error,
    fetchCampaigns: () => {},
    fetchCampaignsWithRetry: () => {},
  };
};
