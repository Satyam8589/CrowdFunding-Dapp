import { useCampaigns } from "../hooks/useCampaigns";

export default function CampaignStats() {
  const { campaigns, isLoading, error } = useCampaigns();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100">
          <div className="animate-pulse">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
              ...
            </div>
            <div className="text-gray-600 font-medium">Total Campaigns</div>
            <div className="mt-4 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100">
          <div className="animate-pulse">
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
              ...
            </div>
            <div className="text-gray-600 font-medium">Active Campaigns</div>
            <div className="mt-4 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100">
          <div className="animate-pulse">
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
              ...
            </div>
            <div className="text-gray-600 font-medium">Total Raised</div>
            <div className="mt-4 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
        <div className="group bg-white p-8 rounded-2xl shadow-lg border border-red-200">
          <div className="text-4xl font-bold text-red-600 mb-4">❌</div>
          <div className="text-gray-600 font-medium">Error Loading Data</div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4">
            0
          </div>
          <div className="text-gray-600 font-medium">Active Campaigns</div>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4">
            0 ETH
          </div>
          <div className="text-gray-600 font-medium">Total Raised</div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter((campaign) => {
    const now = Date.now() / 1000;
    const deadline = parseInt(campaign.deadline);
    return deadline > now && !campaign.withdrawn;
  }).length;

  const totalRaised = campaigns.reduce((sum, campaign) => {
    return sum + parseFloat(campaign.amountCollected || 0);
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center mb-12">
      {/* Total Campaigns */}
      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100">
        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
          {totalCampaigns}
        </div>
        <div className="text-gray-600 font-medium">Total Campaigns</div>
        <div className="mt-4 h-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      </div>

      {/* Active Campaigns */}
      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100">
        <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
          {activeCampaigns}
        </div>
        <div className="text-gray-600 font-medium">Active Campaigns</div>
        <div className="mt-4 h-1 bg-gradient-to-r from-green-400 to-green-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      </div>

      {/* Total Raised */}
      <div className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border border-gray-100">
        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300">
          {totalRaised.toFixed(3)} ETH
        </div>
        <div className="text-gray-600 font-medium">Total Raised</div>
        <div className="mt-4 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
      </div>
    </div>
  );
}
