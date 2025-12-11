const { ethers } = require("hardhat");

async function main() {
    // Get the deployer's account info
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contract with account:", deployer.address);

    // Deploy MyToken contract with an initial supply of 1,000,000 tokens
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(ethers.parseEther("1000000"));

    await myToken.waitForDeployment();

    console.log("MyToken deployed to:", await myToken.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
