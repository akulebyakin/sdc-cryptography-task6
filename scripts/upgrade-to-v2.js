const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Upgrading contract with account:", deployer.address);

    // IMPORTANT: Replace this with your actual proxy address from deployment
    const PROXY_ADDRESS = process.env.PROXY_ADDRESS || "YOUR_PROXY_ADDRESS_HERE";

    if (PROXY_ADDRESS === "YOUR_PROXY_ADDRESS_HERE") {
        console.error("\nERROR: Please set the PROXY_ADDRESS environment variable");
        console.error("Usage: PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade-to-v2.js --network localhost");
        process.exit(1);
    }

    console.log("Proxy Address:", PROXY_ADDRESS);

    // Get balances and state before upgrade
    console.log("\n=== State Before Upgrade ===");
    const proxyV1 = await ethers.getContractAt("MyTokenV1", PROXY_ADDRESS);
    const totalSupplyBefore = await proxyV1.totalSupply();
    const ownerBalanceBefore = await proxyV1.balanceOf(deployer.address);

    console.log("Total Supply:", ethers.formatEther(totalSupplyBefore), "MTK");
    console.log("Owner Balance:", ethers.formatEther(ownerBalanceBefore), "MTK");

    // Get current implementation address
    const implementationV1 = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("Current Implementation (V1):", implementationV1);

    // Upgrade to V2
    console.log("\n=== Upgrading to V2 ===");
    const MyTokenV2 = await ethers.getContractFactory("MyTokenV2");

    console.log("Upgrading proxy...");
    const proxyV2 = await upgrades.upgradeProxy(PROXY_ADDRESS, MyTokenV2);
    await proxyV2.waitForDeployment();

    const implementationV2 = await upgrades.erc1967.getImplementationAddress(PROXY_ADDRESS);
    console.log("New Implementation (V2):", implementationV2);

    // Verify upgrade
    console.log("\n=== Verifying Upgrade ===");
    const totalSupplyAfter = await proxyV2.totalSupply();
    const ownerBalanceAfter = await proxyV2.balanceOf(deployer.address);

    console.log("Total Supply:", ethers.formatEther(totalSupplyAfter), "MTK");
    console.log("Owner Balance:", ethers.formatEther(ownerBalanceAfter), "MTK");

    if (totalSupplyBefore === totalSupplyAfter && ownerBalanceBefore === ownerBalanceAfter) {
        console.log("Balances preserved after upgrade!");
    } else {
        console.log("WARNING: Balances changed after upgrade!");
    }

    console.log("\n=== Testing New V2 Function ===");
    const version = await proxyV2.version();
    console.log("Contract version:", version);

    if (version === "V2") {
        console.log("Upgrade successful! New version() function works!");
    } else {
        console.log("ERROR: version() function returned unexpected value");
    }

    console.log("\n=== Upgrade Summary ===");
    console.log("Proxy Address:", PROXY_ADDRESS);
    console.log("Old Implementation (V1):", implementationV1);
    console.log("New Implementation (V2):", implementationV2);
    console.log("Version:", version);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
