// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CrowdFunding
 * @dev A decentralized crowdfunding platform with 1% admin fee
 */
contract CrowdFunding {
    address public admin;
    uint256 public platformFeePercent = 1; // 1% platform fee
    uint256 public campaignCounter = 0;
    
    struct Campaign {
        uint256 id;
        string title;
        string description;
        string imageUrl;
        address payable owner;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        bool withdrawn;
        address[] donators;
        uint256[] donations;
    }
    
    mapping(uint256 => Campaign) public campaigns;
    
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        string title,
        uint256 target,
        uint256 deadline
    );
    
    event DonationMade(
        uint256 indexed campaignId,
        address indexed donator,
        uint256 amount
    );
    
    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 amount,
        uint256 platformFee
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier campaignExists(uint256 _id) {
        require(_id < campaignCounter, "Campaign does not exist");
        _;
    }
    
    modifier onlyCampaignOwner(uint256 _id) {
        require(msg.sender == campaigns[_id].owner, "Only campaign owner can withdraw");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Create a new crowdfunding campaign
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        string memory _imageUrl,
        uint256 _target,
        uint256 _deadline
    ) public returns (uint256) {
        require(_target > 0, "Target amount must be greater than 0");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        
        Campaign storage campaign = campaigns[campaignCounter];
        
        campaign.id = campaignCounter;
        campaign.owner = payable(msg.sender);
        campaign.title = _title;
        campaign.description = _description;
        campaign.imageUrl = _imageUrl;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.withdrawn = false;
        
        emit CampaignCreated(campaignCounter, msg.sender, _title, _target, _deadline);
        
        campaignCounter++;
        
        return campaignCounter - 1;
    }
    
    /**
     * @dev Donate to a campaign
     */
    function donateToCampaign(uint256 _id) public payable campaignExists(_id) {
        require(msg.value > 0, "Donation amount must be greater than 0");
        require(block.timestamp < campaigns[_id].deadline, "Campaign has ended");
        require(!campaigns[_id].withdrawn, "Funds already withdrawn");
        
        uint256 amount = msg.value;
        
        campaigns[_id].donators.push(msg.sender);
        campaigns[_id].donations.push(amount);
        campaigns[_id].amountCollected += amount;
        
        emit DonationMade(_id, msg.sender, amount);
    }
    
    /**
     * @dev Withdraw funds from campaign (only after deadline)
     */
    function withdrawFunds(uint256 _id) public campaignExists(_id) onlyCampaignOwner(_id) {
        require(block.timestamp >= campaigns[_id].deadline, "Campaign is still active");
        require(campaigns[_id].amountCollected > 0, "No funds to withdraw");
        require(!campaigns[_id].withdrawn, "Funds already withdrawn");
        
        uint256 totalAmount = campaigns[_id].amountCollected;
        uint256 platformFee = (totalAmount * platformFeePercent) / 100;
        uint256 ownerAmount = totalAmount - platformFee;
        
        campaigns[_id].withdrawn = true;
        
        // Transfer platform fee to admin
        if (platformFee > 0) {
            payable(admin).transfer(platformFee);
        }
        
        // Transfer remaining amount to campaign owner
        campaigns[_id].owner.transfer(ownerAmount);
        
        emit FundsWithdrawn(_id, campaigns[_id].owner, ownerAmount, platformFee);
    }
    
    /**
     * @dev Get all donators and their donations for a campaign
     */
    function getDonators(uint256 _id) public view campaignExists(_id) returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }
    
    /**
     * @dev Get all campaigns
     */
    function getAllCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](campaignCounter);
        
        for (uint256 i = 0; i < campaignCounter; i++) {
            Campaign storage item = campaigns[i];
            allCampaigns[i] = item;
        }
        
        return allCampaigns;
    }
    
    /**
     * @dev Get campaign details
     */
    function getCampaign(uint256 _id) public view campaignExists(_id) returns (Campaign memory) {
        return campaigns[_id];
    }
    
    /**
     * @dev Check if campaign deadline has passed
     */
    function isCampaignEnded(uint256 _id) public view campaignExists(_id) returns (bool) {
        return block.timestamp >= campaigns[_id].deadline;
    }
    
    /**
     * @dev Get campaign progress percentage
     */
    function getCampaignProgress(uint256 _id) public view campaignExists(_id) returns (uint256) {
        if (campaigns[_id].target == 0) return 0;
        return (campaigns[_id].amountCollected * 100) / campaigns[_id].target;
    }
    
    /**
     * @dev Admin function to update platform fee (max 5%)
     */
    function updatePlatformFee(uint256 _newFeePercent) public onlyAdmin {
        require(_newFeePercent <= 5, "Platform fee cannot exceed 5%");
        platformFeePercent = _newFeePercent;
    }
    
    /**
     * @dev Admin function to withdraw platform fees
     */
    function withdrawPlatformFees() public onlyAdmin {
        require(address(this).balance > 0, "No fees to withdraw");
        payable(admin).transfer(address(this).balance);
    }
    
    /**
     * @dev Get contract balance (platform fees)
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get total campaigns count
     */
    function getTotalCampaigns() public view returns (uint256) {
        return campaignCounter;
    }
}