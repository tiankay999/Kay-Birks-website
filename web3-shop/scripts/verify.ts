import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  // Load deployment info
  const deploymentPath = path.join(__dirname, "../deployments/latest.json");
  
  if (!fs.existsSync(deploymentPath)) {
    console.error("No deployment found. Please deploy first.");
    process.exit(1);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));

  console.log("Verifying contract:", deployment.contractAddress);
  console.log("Network:", deployment.network);

  try {
    await run("verify:verify", {
      address: deployment.contractAddress,
      constructorArguments: [deployment.merchantWallet],
    });
    
    console.log("Contract verified successfully!");
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log("Contract already verified!");
    } else {
      console.error("Verification failed:", error);
      process.exit(1);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
