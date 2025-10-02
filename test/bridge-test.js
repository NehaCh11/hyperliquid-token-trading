const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");

describe("Bridge Simulation", function () {
  let token;
  const SYSTEM_ADDRESS = "0x2000000000000000000000000000000000000000";

  before(async function () {
    // Deploy TOKEN first
    const TOKEN = await ethers.getContractFactory("TOKEN");
    token = await TOKEN.deploy();
    await token.waitForDeployment();

    // Save deployment info (like bridge.js does)
    const deploymentInfo = {
      contractAddress: await token.getAddress(),
      systemAddress: await token.SYSTEM_ADDRESS(),
    };
    fs.writeFileSync("deployment-info.json", JSON.stringify(deploymentInfo, null, 2));
  });

  it("✅ Should simulate bridging 10,000 TOKEN from System Address", async function () {
    const [user] = await ethers.getSigners();

    // Impersonate system address
    await ethers.provider.send("hardhat_impersonateAccount", [SYSTEM_ADDRESS]);
    const systemSigner = await ethers.getSigner(SYSTEM_ADDRESS);

    // Fund system address with ETH for gas
    await user.sendTransaction({
      to: SYSTEM_ADDRESS,
      value: ethers.parseEther("1"),
    });

    const bridgeAmount = ethers.parseEther("10000");

    // Transfer tokens to user (simulate bridging)
    await token.connect(systemSigner).transfer(user.address, bridgeAmount);

    const balance = await token.balanceOf(user.address);
    expect(balance).to.equal(bridgeAmount);

    console.log(`   ✓ Bridged ${ethers.formatEther(balance)} TOKEN to user wallet`);

    await ethers.provider.send("hardhat_stopImpersonatingAccount", [SYSTEM_ADDRESS]);
  });
});
