const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("===========================================");
    console.log("Deploying SoulboundVisitCardERC721");
    console.log("===========================================");
    console.log("Deployer address:", deployer.address);
    console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

    // Deploy contract
    console.log("Deploying contract...");
    const SoulboundCard = await ethers.getContractFactory("SoulboundVisitCardERC721");
    const card = await SoulboundCard.deploy();
    await card.deployed();

    const address = card.address;
    console.log("✅ Deployment Successful!");
    console.log("Contract deployed to:", address);
    console.log("");

    // Verification
    console.log("===========================================");
    console.log("Verifying Contract");
    console.log("===========================================");
    const name = await card.name();
    const symbol = await card.symbol();
    const owner = await card.owner();

    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("Owner:", owner);
    console.log("");

    // Optional: Mint example card
    console.log("===========================================");
    console.log("Example: Minting a Test Card");
    console.log("===========================================");

    // Example metadata (simple base64 JSON)
    const exampleMetadata = {
        name: "Student Visit Card - John Doe",
        description: "Soulbound student visit card for John Doe",
        image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzRGNDZFNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5TdHVkZW50IENhcmQ8L3RleHQ+PC9zdmc+",
        attributes: [
            { trait_type: "Student Name", value: "John Doe" },
            { trait_type: "Year", value: "Junior" },
            { trait_type: "Course", value: "Computer Science" },
            { trait_type: "Soulbound", value: "Yes" },
            { trait_type: "Mint Date", value: new Date().toISOString() }
        ]
    };

    const jsonString = JSON.stringify(exampleMetadata);
    const base64Json = Buffer.from(jsonString).toString('base64');
    const tokenURI = `data:application/json;base64,${base64Json}`;

    console.log("Minting card to:", deployer.address);
    console.log("Student: John Doe");
    console.log("Year: Junior");
    console.log("Course: Computer Science");

    const tx = await card.mintCard(
        deployer.address,
        tokenURI,
        "John Doe",
        "Junior",
        "Computer Science"
    );

    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Card minted successfully!");

    const tokenId = 0;
    const studentInfo = await card.getStudentInfo(tokenId);
    console.log("\nMinted Card Info:");
    console.log("  Token ID:", tokenId);
    console.log("  Name:", studentInfo.name);
    console.log("  Year:", studentInfo.year);
    console.log("  Course:", studentInfo.course);
    console.log("  Owner:", await card.ownerOf(tokenId));
    console.log("");

    // Try to transfer (should fail - demonstrates soulbound)
    console.log("===========================================");
    console.log("Testing Soulbound Behavior");
    console.log("===========================================");
    console.log("Attempting to transfer card... (this should fail)");

    try {
        await card.transferFrom(deployer.address, "0x0000000000000000000000000000000000000001", tokenId);
        console.log("❌ ERROR: Transfer succeeded (should have failed!)");
    } catch (error) {
        console.log("✅ Transfer blocked successfully! Card is soulbound.");
        console.log("Error:", error.message.split('(')[0].trim());
    }
    console.log("");

    // Final summary
    console.log("===========================================");
    console.log("Deployment Complete!");
    console.log("===========================================");
    console.log("📝 SAVE THIS ADDRESS FOR FRONTEND:");
    console.log("   ", address);
    console.log("");
    console.log("Next steps:");
    console.log("  1. Copy the contract address above");
    console.log("  2. Update the frontend with this address");
    console.log("  3. Use the frontend UI to mint student visit cards");
    console.log("");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
