const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying Poker contract...");

  // Get the contract factory
  const Poker = await ethers.getContractFactory("Poker");

  // Deploy the contract
  const poker = await Poker.deploy();
  await poker.deployed();

  console.log("Poker contract deployed to:", poker.address);
  console.log("Owner:", await poker.owner());
  console.log("Max players:", await poker.MAXNUMPLAYERS());
  console.log("Min players:", await poker.MINPLAYERS());
  console.log("Min buy-in:", ethers.utils.formatEther(await poker.MINBUYIN()), "ETH");
  console.log("Max buy-in:", ethers.utils.formatEther(await poker.MAXBUYIN()), "ETH");

  // Verify the deployment
  console.log("\nVerifying deployment...");

  const gameState = await poker.getGameState();
  console.log("Initial game state:");
  console.log("- Small blind:", gameState.smallBlind.toString());
  console.log("- Big blind:", gameState.bigBlind.toString());
  console.log("- Current round:", gameState.currentRound.toString());
  console.log("- Game active:", gameState.gameActive);

  console.log("\nDeployment completed successfully!");
  console.log("Contract address:", poker.address);

  return poker;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
