const { ethers } = require("hardhat");

async function main() {
    const [deployer, account1, account2] = await ethers.getSigners();

    console.log("Interacting with account:", deployer.address);
    console.log("Test Account 1:", account1.address);
    console.log("Test Account 2:", account2.address);

    // IMPORTANT: Replace this with your actual proxy address from deployment
    const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "YOUR_PROXY_ADDRESS_HERE";

    if (PROXY_ADDRESS === "YOUR_PROXY_ADDRESS_HERE") {
        console.error("\nERROR: Please set the PROXY_ADDRESS environment variable");
        console.error("Usage: PROXY_ADDRESS=0x... npx hardhat run scripts/interact.js --network localhost");
        process.exit(1);
    }

    console.log("\nProxy Address:", PROXY_ADDRESS);

    // Connect to the proxy (works with both V1 and V2)
    const token = await ethers.getContractAt("MyTokenV1", PROXY_ADDRESS);

    // Display initial balances
    console.log("\n=== Initial Balances ===");
    const deployerBalance = await token.balanceOf(deployer.address);
    const account1Balance = await token.balanceOf(account1.address);
    const account2Balance = await token.balanceOf(account2.address);
    const totalSupply = await token.totalSupply();

    console.log("Deployer:", ethers.formatEther(deployerBalance), "MTK");
    console.log("Account 1:", ethers.formatEther(account1Balance), "MTK");
    console.log("Account 2:", ethers.formatEther(account2Balance), "MTK");
    console.log("Total Supply:", ethers.formatEther(totalSupply), "MTK");

    // Mint tokens to account1
    console.log("\n=== Minting Tokens ===");
    const mintAmount = ethers.parseEther("1000");
    console.log("Minting", ethers.formatEther(mintAmount), "MTK to", account1.address);

    const mintTx = await token.mint(account1.address, mintAmount);
    await mintTx.wait();
    console.log("Mint transaction confirmed:", mintTx.hash);

    console.log("\n=== Transferring Tokens ===");
    const transferAmount = ethers.parseEther("500");
    console.log("Transferring", ethers.formatEther(transferAmount), "MTK from deployer to", account2.address);

    const transferTx = await token.transfer(account2.address, transferAmount);
    await transferTx.wait();
    console.log("Transfer transaction confirmed:", transferTx.hash);

    console.log("\nTransferring", ethers.formatEther(transferAmount), "MTK from account1 to", account2.address);
    const tokenAsAccount1 = token.connect(account1);
    const transferTx2 = await tokenAsAccount1.transfer(account2.address, transferAmount);
    await transferTx2.wait();
    console.log("Transfer transaction confirmed:", transferTx2.hash);

    // Display final balances
    console.log("\n=== Final Balances ===");
    const deployerBalanceFinal = await token.balanceOf(deployer.address);
    const account1BalanceFinal = await token.balanceOf(account1.address);
    const account2BalanceFinal = await token.balanceOf(account2.address);
    const totalSupplyFinal = await token.totalSupply();

    console.log("Deployer:", ethers.formatEther(deployerBalanceFinal), "MTK");
    console.log("Account 1:", ethers.formatEther(account1BalanceFinal), "MTK");
    console.log("Account 2:", ethers.formatEther(account2BalanceFinal), "MTK");
    console.log("Total Supply:", ethers.formatEther(totalSupplyFinal), "MTK");

    // Try to call version() if V2 is deployed
    console.log("\n=== Checking Version ===");
    try {
        const tokenV2 = await ethers.getContractAt("MyTokenV2", PROXY_ADDRESS);
        const version = await tokenV2.version();
        console.log("Contract version:", version);
    } catch (error) {
        console.log("version() function not available (likely using V1)");
    }

    console.log("\n=== Summary ===");
    console.log("All interactions completed successfully!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
