import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

  // Get merchant wallet from environment or use deployer
  const merchantWallet = process.env.MERCHANT_WALLET_ADDRESS || deployer.address;

  console.log("Merchant wallet:", merchantWallet);

  // Deploy PaymentProcessor
  const PaymentProcessor = await ethers.getContractFactory("PaymentProcessor");
  const paymentProcessor = await PaymentProcessor.deploy(merchantWallet);

  await paymentProcessor.waitForDeployment();

  const contractAddress = await paymentProcessor.getAddress();
  console.log("PaymentProcessor deployed to:", contractAddress);

  // Add USDC as supported token (Sepolia testnet USDC)
  const usdcAddress = process.env.NEXT_PUBLIC_USDC_TOKEN_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  
  if (usdcAddress && usdcAddress !== "0x...") {
    console.log("Adding USDC as supported token:", usdcAddress);
    const tx = await paymentProcessor.addSupportedToken(usdcAddress);
    await tx.wait();
    console.log("USDC added successfully");
  }

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contractAddress: contractAddress,
    merchantWallet: merchantWallet,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    usdcToken: usdcAddress,
  };

  const deploymentPath = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentPath, "latest.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\nDeployment info saved to deployments/latest.json");
  console.log("\nNext steps:");
  console.log("1. Update .env with NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=" + contractAddress);
  console.log("2. Verify contract: pnpm contract:verify " + contractAddress + " " + merchantWallet);
  console.log("3. Add contract ABI to frontend");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
