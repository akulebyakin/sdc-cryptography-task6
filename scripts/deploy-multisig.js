const { ethers } = require("hardhat");

async function main() {
    const [deployer, owner1, owner2] = await ethers.getSigners();

    console.log("Deploying MultiSigWallet with account:", deployer.address);
    console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

    const owners = [deployer.address, owner1.address, owner2.address];
    const numConfirmationsRequired = 2;

    console.log("\n=== Configuration ===");
    console.log("Owners:", owners);
    console.log("Required Confirmations:", numConfirmationsRequired);

    const MultiSigWallet = await ethers.getContractFactory("MultiSigWallet");
    const multiSig = await MultiSigWallet.deploy(owners, numConfirmationsRequired);

    await multiSig.waitForDeployment();

    const address = await multiSig.getAddress();
    console.log("\n=== Deployment Successful ===");
    console.log("MultiSigWallet deployed to:", address);

    console.log("\n=== Verifying Deployment ===");
    const contractOwners = await multiSig.getOwners();
    const requiredConfs = await multiSig.numConfirmationsRequired();

    console.log("Contract Owners:", contractOwners);
    console.log("Required Confirmations:", requiredConfs.toString());

    console.log("\n=== Funding Wallet ===");
    const fundAmount = ethers.parseEther("10");
    const tx = await deployer.sendTransaction({
        to: address,
        value: fundAmount
    });
    await tx.wait();

    const balance = await ethers.provider.getBalance(address);
    console.log("Wallet funded with:", ethers.formatEther(fundAmount), "ETH");
    console.log("Current balance:", ethers.formatEther(balance), "ETH");

    console.log("\n=== Deployment Complete ===");
    console.log("MultiSigWallet address:", address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
