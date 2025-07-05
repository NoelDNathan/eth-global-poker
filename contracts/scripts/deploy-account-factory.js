// Import necessary modules and libraries
const { ethers } = require("hardhat");
const hre = require("hardhat");

async function verifyContract(contractAddress, constructorArgs) {
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error.message);
    if (error.message.includes("already verified")) {
      console.log("Contract was already verified.");
    }
  }
}

async function main() {
  // Get the contract factory
  const AccountFactory = await ethers.getContractFactory("AccountFactory");

  // Define the constructor arguments
  const defaultAdmin = "0x70a58596794A3d67DA833963057f37E3735c1760"; // Replace with actual address
  const entrypoint = "0x70a58596794A3d67DA833963057f37E3735c1760"; // Replace with actual address
  const proofOfHumanContract = "0x0697368AfA6401d4449D1F99CF90De39D77FB156"; // Replace with actual address

  // Deploy the contract
  const accountFactory = await AccountFactory.deploy(
    defaultAdmin,
    entrypoint,
    proofOfHumanContract
  );


  await accountFactory.waitForDeployment();
  const contractAddress = await accountFactory.getAddress();

  console.log("AccountFactory deployed to:", contractAddress);

  const constructorArgs = [defaultAdmin, entrypoint, proofOfHumanContract];

  await verifyContract(contractAddress, constructorArgs);
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
