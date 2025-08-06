const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CrowdfundingPlatform", function () {
  let CrowdfundingPlatform, crowdfundingPlatform, owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    CrowdfundingPlatform = await ethers.getContractFactory(
      "CrowdfundingPlatform"
    );
    crowdfundingPlatform = await CrowdfundingPlatform.deploy();
    await crowdfundingPlatform.waitForDeployment();
  });

  it("should create a new campaign", async function () {
    await crowdfundingPlatform.createCampaign(
      "Test Campaign",
      "This is a test description",
      ethers.parseEther("10"),
      Math.floor(Date.now() / 1000) + 86400,
      "image.png"
    );

    const campaigns = await crowdfundingPlatform.getCampaigns();
    expect(campaigns.length).to.equal(1);
    expect(campaigns[0].title).to.equal("Test Campaign");
  });

  it("should accept donations and track them correctly", async function () {
    await crowdfundingPlatform
      .connect(addr1)
      .createCampaign(
        "Donation Campaign",
        "Donation description",
        ethers.parseEther("5"),
        Math.floor(Date.now() / 1000) + 86400,
        "image.png"
      );

    await crowdfundingPlatform
      .connect(addr2)
      .donateToCampaign(0, { value: ethers.parseEther("1") });
    const [donators, donations] = await crowdfundingPlatform.getDonators(0);

    expect(donators.length).to.equal(1);
    expect(donators[0]).to.equal(addr2.address);
    expect(donations[0]).to.equal(ethers.parseEther("1"));
  });

  it("should allow the owner to withdraw funds", async function () {
    await crowdfundingPlatform
      .connect(addr1)
      .createCampaign(
        "Withdraw Campaign",
        "Withdraw test",
        ethers.parseEther("3"),
        Math.floor(Date.now() / 1000) + 86400,
        "image.png"
      );

    await crowdfundingPlatform
      .connect(addr2)
      .donateToCampaign(0, { value: ethers.parseEther("2") });

    const campaignBefore = await crowdfundingPlatform.getCampaign(0);
    expect(campaignBefore.amountCollected).to.equal(ethers.parseEther("2"));

    await crowdfundingPlatform.connect(addr1).withdrawFunds(0);
    const campaignAfter = await crowdfundingPlatform.getCampaign(0);
    expect(campaignAfter.amountCollected).to.equal(0);
  });
});
