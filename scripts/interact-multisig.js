const { ethers } = require("hardhat");

async function main() {
    const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS || "0x68B1D87F95878fE05B998F19b66F4baba5De1aed";

    if (MULTISIG_ADDRESS === "YOUR_MULTISIG_ADDRESS_HERE") {
        console.error("\nERROR: Please set the MULTISIG_ADDRESS environment variable");
        console.error("Usage: MULTISIG_ADDRESS=0x... npx hardhat run scripts/interact-multisig.js --network localhost");
        process.exit(1);
    }

    const [owner1, owner2, owner3, recipient] = await ethers.getSigners();

    console.log("Interacting with MultiSigWallet at:", MULTISIG_ADDRESS);
    console.log("Owner 1:", owner1.address);
    console.log("Owner 2:", owner2.address);
    console.log("Owner 3:", owner3.address);
    console.log("Recipient:", recipient.address);

    const multiSig = await ethers.getContractAt("MultiSigWallet", MULTISIG_ADDRESS);

    console.log("\n=== Wallet Info ===");
    const owners = await multiSig.getOwners();
    const required = await multiSig.numConfirmationsRequired();
    const balance = await ethers.provider.getBalance(MULTISIG_ADDRESS);

    console.log("Owners:", owners);
    console.log("Required Confirmations:", required.toString());
    console.log("Wallet Balance:", ethers.formatEther(balance), "ETH");

    console.log("\n=== Submitting Transaction ===");
    const transferAmount = ethers.parseEther("1");
    const to = recipient.address;
    const data = "0x";

    console.log("Submitting transfer of", ethers.formatEther(transferAmount), "ETH to", to);
    const submitTx = await multiSig.connect(owner1).submitTransaction(to, transferAmount, data);
    await submitTx.wait();
    console.log("Transaction submitted. Hash:", submitTx.hash);

    const txCount = await multiSig.getTransactionCount();
    const txIndex = txCount - 1n;
    console.log("Transaction Index:", txIndex.toString());

    console.log("\n=== Confirming Transaction ===");
    console.log("Owner 1 confirming...");
    const confirm1Tx = await multiSig.connect(owner1).confirmTransaction(txIndex);
    await confirm1Tx.wait();
    console.log("Confirmation 1 complete. Hash:", confirm1Tx.hash);

    console.log("Owner 2 confirming...");
    const confirm2Tx = await multiSig.connect(owner2).confirmTransaction(txIndex);
    await confirm2Tx.wait();
    console.log("Confirmation 2 complete. Hash:", confirm2Tx.hash);

    let tx = await multiSig.getTransaction(txIndex);
    console.log("Current confirmations:", tx.numConfirmations.toString());

    console.log("\n=== Executing Transaction ===");
    const recipientBalanceBefore = await ethers.provider.getBalance(recipient.address);
    console.log("Recipient balance before:", ethers.formatEther(recipientBalanceBefore), "ETH");

    console.log("Executing transaction...");
    const executeTx = await multiSig.connect(owner1).executeTransaction(txIndex);
    await executeTx.wait();
    console.log("Transaction executed. Hash:", executeTx.hash);

    tx = await multiSig.getTransaction(txIndex);
    console.log("Transaction executed:", tx.executed);

    const recipientBalanceAfter = await ethers.provider.getBalance(recipient.address);
    const walletBalanceAfter = await ethers.provider.getBalance(MULTISIG_ADDRESS);

    console.log("\n=== Final Balances ===");
    console.log("Recipient balance:", ethers.formatEther(recipientBalanceAfter), "ETH");
    console.log("Wallet balance:", ethers.formatEther(walletBalanceAfter), "ETH");
    console.log("Amount transferred:", ethers.formatEther(recipientBalanceAfter - recipientBalanceBefore), "ETH");

    console.log("\n=== Interaction Complete ===");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
