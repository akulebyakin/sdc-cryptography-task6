const { ethers } = require("hardhat");

async function main() {
    // Get command line arguments
    const receiver = process.env.RECEIVER || process.argv[2];
    const amount = process.env.AMOUNT || process.argv[3] || "100";

    if (!receiver) {
        console.error("Error: Receiver address is required");
        console.log("\nUsage:");
        console.log("  RECEIVER=0xAddress AMOUNT=100 npx hardhat run scripts/send-eth.js --network localhost");
        console.log("  OR");
        console.log("  npx hardhat run scripts/send-eth.js --network localhost 0xAddress 100");
        process.exit(1);
    }

    const [sender] = await ethers.getSigners();

    console.log("Sender:", sender.address);
    console.log("Receiver:", receiver);
    console.log("Amount:", amount, "ETH");

    // Check sender balance
    const balance = await ethers.provider.getBalance(sender.address);
    console.log("Sender balance:", ethers.formatEther(balance), "ETH");

    // Send transaction
    const tx = await sender.sendTransaction({
        to: receiver,
        value: ethers.parseEther(amount)
    });

    console.log("\nTransaction hash:", tx.hash);
    console.log("Waiting for confirmation...");

    await tx.wait();

    console.log("✓ Transaction confirmed!");

    // Check new balances
    const newSenderBalance = await ethers.provider.getBalance(sender.address);
    const receiverBalance = await ethers.provider.getBalance(receiver);

    console.log("\nNew balances:");
    console.log("Sender:", ethers.formatEther(newSenderBalance), "ETH");
    console.log("Receiver:", ethers.formatEther(receiverBalance), "ETH");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
