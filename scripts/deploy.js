const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TOKEN to HyperEVM Testnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "HYPE\n");

  if (balance === 0n) {
    console.log("❌ Error: No balance! Get testnet HYPE tokens first.");
    process.exit(1);
  }

  console.log("Deploying TOKEN contract...");
  const TOKEN = await hre.ethers.getContractFactory("TOKEN");
  const token = await TOKEN.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();
  
  console.log("\n✅ TOKEN deployed successfully!");
  console.log("═══════════════════════════════════════════════");
  console.log("Contract Address:", tokenAddress);
  console.log("Transaction Hash:", token.deploymentTransaction().hash);
  console.log("═══════════════════════════════════════════════");
  console.log("\n📊 Token Details:");
  console.log("  Name:", await token.name());
  console.log("  Symbol:", await token.symbol());
  console.log("  Decimals:", await token.decimals());
  console.log("  Total Supply:", hre.ethers.formatEther(await token.totalSupply()), "TOKEN");
  console.log("  System Address:", await token.SYSTEM_ADDRESS());
  
  console.log("\n🔗 View on Explorer:");
  console.log(`https://explorer.hyperliquid-testnet.xyz/address/${tokenAddress}`);

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: "HyperEVM Testnet",
    contractAddress: tokenAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    txHash: token.deploymentTransaction().hash,
    systemAddress: await token.SYSTEM_ADDRESS()
  };
  
  fs.writeFileSync(
    "deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n📝 Deployment info saved to deployment-info.json");
  console.log("\n✅ Step 1 Complete! Ready for Step 2: Bridging to HyperCore");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });