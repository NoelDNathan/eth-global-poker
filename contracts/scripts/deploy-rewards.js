const hre = require("hardhat");
require("dotenv").config();

async function main() {
  console.log("Deploying Rewards contract...");

  // Get ProofOfHuman contract address from environment variable
  const proofOfHumanAddress = process.env.PROOF_OF_HUMAN_ADDRESS;
  if (!proofOfHumanAddress) {
    throw new Error("PROOF_OF_HUMAN_ADDRESS not set in environment");
  }
  console.log("Using ProofOfHuman at:", proofOfHumanAddress);

  // Deploy the contract
  const Rewards = await hre.ethers.getContractFactory("Rewards");
  const rewards = await Rewards.deploy(proofOfHumanAddress);

  await rewards.waitForDeployment();
  const contractAddress = await rewards.getAddress();

  console.log("Rewards deployed to:", contractAddress);
  console.log("Network:", hre.network.name);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await rewards.deploymentTransaction().wait(5);

  // Verify the contract
  if (hre.network.name === "alfajores" && process.env.CELOSCAN_API_KEY) {
    console.log("Verifying contract on Celoscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [proofOfHumanAddress],
        network: "alfajores",
      });
      console.log("Contract verified successfully!");
    } catch (error) {
      console.log("Verification failed:", error.message);
      if (error.message.includes("already verified")) {
        console.log("Contract was already verified.");
      }
    }
  } else if (!process.env.CELOSCAN_API_KEY) {
    console.log("Skipping verification: CELOSCAN_API_KEY not found in environment");
  }

  // Save deployment info
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress: contractAddress,
    proofOfHumanAddress: proofOfHumanAddress,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.provider.getSigner()).address,
  };

  fs.writeFileSync("./deployments/latest.json", JSON.stringify(deploymentInfo, null, 2));

  console.log("\nDeployment complete!");
  console.log("Contract address:", contractAddress);
  console.log("\nNext steps:");
  console.log("1. Update your frontend or dapp with the new Rewards contract address.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
