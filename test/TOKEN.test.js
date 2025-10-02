const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TOKEN Contract Tests", function () {
  let token;
  const SYSTEM_ADDRESS = "0x2000000000000000000000000000000000000000";

  before(async function () {
    console.log("\n🚀 Deploying TOKEN contract...");
    const TOKEN = await ethers.getContractFactory("TOKEN");
    token = await TOKEN.deploy();
    await token.waitForDeployment();
    console.log("✅ Deployed at:", await token.getAddress());
  });

  it("✅ Step 1: Should have correct name", async function () {
    const name = await token.name();
    expect(name).to.equal("My Token");
    console.log("   Name:", name);
  });

  it("✅ Step 2: Should have correct symbol", async function () {
    const symbol = await token.symbol();
    expect(symbol).to.equal("TOKEN");
    console.log("   Symbol:", symbol);
  });

  it("✅ Step 3: Should have 18 decimals", async function () {
    const decimals = await token.decimals();
    expect(decimals).to.equal(18);
    console.log("   Decimals:", decimals);
  });

  it("✅ Step 4: Should have correct total supply", async function () {
    const totalSupply = await token.totalSupply();
    const expected = ethers.parseEther("1000000");
    expect(totalSupply).to.equal(expected);
    console.log("   Total Supply:", ethers.formatEther(totalSupply), "TOKEN");
  });

  it("✅ Step 5: System address should have all tokens", async function () {
    const balance = await token.balanceOf(SYSTEM_ADDRESS);
    const totalSupply = await token.totalSupply();
    expect(balance).to.equal(totalSupply);
    console.log("   System Address Balance:", ethers.formatEther(balance), "TOKEN");
  });

  it("✅ Step 6: System address constant is correct", async function () {
    const addr = await token.SYSTEM_ADDRESS();
    expect(addr).to.equal(SYSTEM_ADDRESS);
    console.log("   System Address:", addr);
  });

  it("✅ Step 7: Can transfer tokens from system address", async function () {
    // Impersonate system address
    await ethers.provider.send("hardhat_impersonateAccount", [SYSTEM_ADDRESS]);
    const systemSigner = await ethers.getSigner(SYSTEM_ADDRESS);
    
    // Get a regular account to receive tokens
    const [owner] = await ethers.getSigners();
    
    // Fund system address with ETH for gas
    await owner.sendTransaction({
      to: SYSTEM_ADDRESS,
      value: ethers.parseEther("1")
    });

    // Transfer tokens
    const transferAmount = ethers.parseEther("1000");
    await token.connect(systemSigner).transfer(owner.address, transferAmount);

    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(transferAmount);
    console.log("   ✓ Successfully transferred", ethers.formatEther(transferAmount), "TOKEN");
    
    await ethers.provider.send("hardhat_stopImpersonatingAccount", [SYSTEM_ADDRESS]);
  });
});