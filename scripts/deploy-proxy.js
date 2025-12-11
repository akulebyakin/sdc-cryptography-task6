const { ethers, upgrades } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await ethers.provider.getBalance(deployer.address)).toString());

    // Initial supply: 1,000,000 tokens
    const initialSupply = ethers.parseEther("1000000");

    console.log("\n=== Deploying MyTokenV1 Implementation ===");

    // Get the contract factory
    const MyTokenV1 = await ethers.getContractFactory("MyTokenV1");

    // Deploy the proxy with the implementation
    // This deploys both the implementation contract and the ERC1967Proxy
    console.log("Deploying proxy and implementation...");
    const proxy = await upgrades.deployProxy(MyTokenV1, [initialSupply], {
        initializer: "initialize",
        kind: "uups"
    });

    await proxy.waitForDeployment();

    const proxyAddress = await proxy.getAddress();
    console.log("Proxy deployed to:", proxyAddress);

    // Get the implementation address
    const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
    console.log("Implementation (V1) deployed to:", implementationAddress);

    // Verify deployment
    console.log("\n=== Verifying Deployment ===");
    const name = await proxy.name();
    const symbol = await proxy.symbol();
    const totalSupply = await proxy.totalSupply();
    const ownerBalance = await proxy.balanceOf(deployer.address);

    console.log("Token Name:", name);
    console.log("Token Symbol:", symbol);
    console.log("Total Supply:", ethers.formatEther(totalSupply), "MTK");
    console.log("Owner Balance:", ethers.formatEther(ownerBalance), "MTK");

    console.log("\n=== Deployment Summary ===");
    console.log("Save these addresses for upgrade script:");
    console.log("Proxy Address:", proxyAddress);
    console.log("Implementation V1 Address:", implementationAddress);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
